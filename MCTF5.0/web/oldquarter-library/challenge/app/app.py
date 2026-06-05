import os
import sqlite3
import subprocess
import secrets
import jwt
from flask import Flask, request, render_template, redirect, url_for, session, abort, jsonify, g

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DEBUG_DIR = os.path.join(BASE_DIR, 'debug')
DB_PATH = os.environ.get('LIBRARY_DB', '/var/lib/library/library.db')


STAFF_JWT_SECRET = 'oldquarter-staff-d3v-prod-2026'
STAFF_JWT_ALG = 'HS256'

app = Flask(__name__, static_folder=None)
app.config['SECRET_KEY'] = secrets.token_hex(32)
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024


def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(
            f'file:{DB_PATH}?mode=ro&immutable=1',
            uri=True,
        )
        g.db.row_factory = sqlite3.Row
    return g.db


@app.teardown_appcontext
def close_db(exc):
    db = g.pop('db', None)
    if db is not None:
        db.close()


@app.context_processor
def inject_globals():
    return {
        'site_name': 'The Old Quarter Public Library',
        'current_user': session.get('username'),
    }


@app.route('/')
def index():
    db = get_db()
    featured = db.execute(
        'SELECT id, title, author, year, genre FROM books ORDER BY added_at DESC LIMIT 6'
    ).fetchall()
    popular = db.execute(
        'SELECT id, title, author, year, genre FROM books ORDER BY loan_count DESC LIMIT 4'
    ).fetchall()
    return render_template('index.html', featured=featured, popular=popular)


@app.route('/catalog')
def catalog():
    db = get_db()
    page = max(1, int(request.args.get('page', '1') or 1))
    per_page = 12
    offset = (page - 1) * per_page

    genre = request.args.get('genre', '').strip()
    if genre:
        rows = db.execute(
            'SELECT id, title, author, year, genre FROM books WHERE genre = ? '
            'ORDER BY title LIMIT ? OFFSET ?',
            (genre, per_page, offset)
        ).fetchall()
        total = db.execute('SELECT COUNT(*) FROM books WHERE genre = ?', (genre,)).fetchone()[0]
    else:
        rows = db.execute(
            'SELECT id, title, author, year, genre FROM books ORDER BY title LIMIT ? OFFSET ?',
            (per_page, offset)
        ).fetchall()
        total = db.execute('SELECT COUNT(*) FROM books').fetchone()[0]

    genres = [r[0] for r in db.execute('SELECT DISTINCT genre FROM books ORDER BY genre').fetchall()]
    pages = max(1, (total + per_page - 1) // per_page)
    return render_template('catalog.html', books=rows, page=page, pages=pages,
                           genre=genre, genres=genres, total=total)


@app.route('/book/<int:book_id>')
def book_detail(book_id):
    db = get_db()
    book = db.execute(
        'SELECT id, title, author, year, genre, isbn, description, loan_count, available '
        'FROM books WHERE id = ?', (book_id,)
    ).fetchone()
    if not book:
        abort(404)
    related = db.execute(
        'SELECT id, title, author FROM books WHERE genre = ? AND id != ? LIMIT 3',
        (book['genre'], book_id)
    ).fetchall()
    return render_template('book.html', book=book, related=related)


@app.route('/search')
def search():
    q = request.args.get('q', '').strip()
    results = []
    if q:
        db = get_db()
        like = f'%{q}%'
        results = db.execute(
            'SELECT id, title, author, year, genre FROM books '
            'WHERE title LIKE ? OR author LIKE ? OR isbn LIKE ? '
            'ORDER BY title LIMIT 50',
            (like, like, like)
        ).fetchall()
    return render_template('search.html', q=q, results=results)


@app.route('/api/search')
def api_search():
    q = request.args.get('q', '').strip()
    if not q or len(q) < 2:
        return jsonify({'results': []})
    db = get_db()
    like = f'%{q}%'
    rows = db.execute(
        'SELECT id, title, author FROM books WHERE title LIKE ? OR author LIKE ? LIMIT 8',
        (like, like)
    ).fetchall()
    return jsonify({'results': [dict(r) for r in rows]})


@app.route('/api/books')
def api_books():
    db = get_db()
    rows = db.execute(
        'SELECT id, title, author, year, genre FROM books ORDER BY title LIMIT 100'
    ).fetchall()
    return jsonify([dict(r) for r in rows])


@app.route('/about')
def about():
    return render_template('about.html')


@app.route('/hours')
def hours():
    return render_template('hours.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        error = 'The patron portal is currently undergoing maintenance. Please try again later.'
    return render_template('login.html', error=error)


@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))


@app.route('/health')
def health():
    return {'status': 'ok'}


def _require_staff_token():

    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        abort(401, description='missing bearer token')
    token = auth[len('Bearer '):].strip()
    try:
        payload = jwt.decode(token, STAFF_JWT_SECRET, algorithms=[STAFF_JWT_ALG])
    except jwt.PyJWTError as e:
        abort(401, description=f'invalid token: {e}')
    if payload.get('role') != 'admin':
        abort(403, description='staff role required')
    return payload

def _require_admin_token():

    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        abort(401, description='missing bearer token')
    token = auth[len('Bearer '):].strip()
    try:
        payload = jwt.decode(token, STAFF_JWT_SECRET, algorithms=[STAFF_JWT_ALG])
    except jwt.PyJWTError as e:
        abort(401, description=f'invalid token: {e}')
    if payload.get('role') != 'staff':
        abort(403, description='staff role required')
    return payload


def _run_processor(action, filename=''):

    env = os.environ.copy()
    env['DEBUG_ACTION'] = action
    env['DEBUG_FILENAME'] = filename
    try:
        subprocess.run(
            ['python3', 'metadata_processor.py'],
            cwd=DEBUG_DIR,
            env=env,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            timeout=8,
        )
        return b'', 202, {'Content-Type': 'text/plain; charset=utf-8'}
    except subprocess.TimeoutExpired:
        return b'', 504, {'Content-Type': 'text/plain; charset=utf-8'}
    except Exception:
        return b'', 500, {'Content-Type': 'text/plain; charset=utf-8'}


@app.route('/api/admin/debug', methods=['GET'])
def _staff_book_processor():
    _require_admin_token()
    action = request.args.get('action', 'status')
    if action not in ('status', 'list_fixtures'):
        return b'allowed actions: status, list_fixtures\n', 400, {
            'Content-Type': 'text/plain; charset=utf-8'
        }
    return _run_processor(action)


@app.route('/api/admin/upload', methods=['POST'])
def _staff_fixture_upload():
    _require_staff_token()

    filename = request.args.get('filename', '').strip()
    if not filename:
        return b'filename required\n', 400, {'Content-Type': 'text/plain; charset=utf-8'}

    filename = os.path.basename(filename)
    if not filename or filename.startswith('.'):
        return b'invalid filename\n', 400, {'Content-Type': 'text/plain; charset=utf-8'}

    RESERVED = {'metadata_processor.py', '__init__.py', '__main__.py'}
    if filename in RESERVED:
        return b'reserved filename\n', 400, {'Content-Type': 'text/plain; charset=utf-8'}

    body = request.get_data() or b''
    target = os.path.join(DEBUG_DIR, filename)
    try:
        with open(target, 'wb') as f:
            f.write(body)
    except OSError as e:
        return f'write failed: {e}\n'.encode(), 500, {'Content-Type': 'text/plain; charset=utf-8'}

    return (f'uploaded {filename} ({len(body)} bytes)\n'.encode(),
            200, {'Content-Type': 'text/plain; charset=utf-8'})


@app.errorhandler(404)
def not_found(e):
    return render_template('404.html'), 404


@app.errorhandler(500)
def server_error(e):
    return render_template('500.html'), 500


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=False)