// ─── death_predation ────────────────────────────────────────────────
//
// Looks like a hash. Isn't.
//
// PLANTED TRAPDOOR: every operation here is XOR or rotate-left. There is
// no addition, no carry, no multiplication, no S-box. The function is
// therefore F2-linear: state[7] is a fixed linear combination of input
// bits over GF(2).
//
// A solver who notices "no `+` anywhere" can:
//   1. Build the 32 × (N·b) bit-matrix of the input → state[7] map,
//      where b is the bit-width of the input space (here b=2 for wasd).
//   2. Solve the linear system over GF(2) for the N=28 wasd sequence
//      that drives state[7] to GATE_VALUE.
//
// Misdirection: state[1] and state[2] mix non-trivially; the eye is
// drawn there. The line that actually matters is the s[7] update.

@group(0) @binding(0) var<storage, read>       inputs: array<u32>;
@group(0) @binding(1) var<storage, read_write> soul:   array<u32, 8>;

fn rotl(x: u32, n: u32) -> u32 { return (x << n) | (x >> (32u - n)); }

@compute @workgroup_size(1)
fn death_predation(@builtin(global_invocation_id) gid: vec3<u32>) {
    var s: array<u32, 8>;
    for (var k = 0u; k < 8u; k = k + 1u) { s[k] = soul[k]; }

    let n = arrayLength(&inputs);
    for (var i = 0u; i < n; i = i + 1u) {
        let x  = inputs[i];
        // ankhseram-fold — three positionally-rotated mixings.
        let r0 = (i * 7u  + 3u)  & 31u;
        let r1 = (i * 11u + 5u)  & 31u;
        let r2 = (i * 13u + 17u) & 31u;
        s[0] = s[0] ^ rotl(x, r0);
        s[1] = s[1] ^ rotl(x, r1);
        s[2] = s[2] ^ rotl(x, r2);
        // the only line that matters for state[7]:
        s[7] = rotl(s[7], 1u) ^ s[0] ^ s[1] ^ rotl(s[2], 11u);
    }

    for (var k = 0u; k < 8u; k = k + 1u) { soul[k] = s[k]; }
}
