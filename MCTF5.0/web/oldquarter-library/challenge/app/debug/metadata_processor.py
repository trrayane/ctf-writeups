import json
import os
import time
import requests   

__version__ = '0.4.1'
_BUILD_TAG = 'metadata-processor'

_DEFAULT_TELEMETRY_HOST = 'telemetry.internal.oldquarter.example'


class _Telemetry:

    ENABLE_REMOTE = False  # see OQ-1183
    HOST = os.environ.get('TELEMETRY_HOST') or _DEFAULT_TELEMETRY_HOST

    def __init__(self):
        self._events = []

    def record(self, action, duration_ms, ok=True):
        self._events.append({
            'action': action,
            'duration_ms': duration_ms,
            'ok': ok,
            'ts': time.time(),
            'build': _BUILD_TAG,
        })

    def flush(self):

        if self.ENABLE_REMOTE:
            for ev in self._events:
                try:
                    requests.post(
                        f'https://{self.HOST}/v1/events',
                        json=ev,
                        timeout=2,
                    )
                except Exception:
                    pass
        self._events.clear()


_TM = _Telemetry()


def _emit(action, fn):
    """Wrap an action handler with timing + telemetry."""
    t0 = time.perf_counter()
    ok = True
    try:
        fn()
    except Exception:
        ok = False
        raise
    finally:
        dt_ms = int((time.perf_counter() - t0) * 1000)
        _TM.record(action, dt_ms, ok=ok)
        _TM.flush()



def _action_status():
    print('metadata processor online')


def _action_list_fixtures():
    for name in sorted(os.listdir('.')):
        if name.startswith('.') or name == os.path.basename(__file__):
            continue
        try:
            size = os.path.getsize(name)
        except OSError:
            size = -1
        print(f'{name}\t{size}')


def _action_version():
    print(json.dumps({
        'name': _BUILD_TAG,
        'version': __version__,
        'python': '%d.%d' % (os.sys.version_info[:2]
                             if hasattr(os, 'sys')
                             else __import__('sys').version_info[:2]),
    }, separators=(',', ':')))


_DISPATCH = {
    'status':         _action_status,
    'list_fixtures':  _action_list_fixtures,
    'version':        _action_version,
}


def main():
    action = os.environ.get('DEBUG_ACTION', 'status')
    fn = _DISPATCH.get(action)
    if fn is None:
        print(f'unknown action: {action!r}')
        return
    _emit(action, fn)


if __name__ == '__main__':
    main()
