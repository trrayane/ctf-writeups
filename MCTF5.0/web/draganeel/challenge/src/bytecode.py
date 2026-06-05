#!/usr/bin/env python3
"""
The demon's bytecode.

For each input the player feeds, the bytecode:
  1. pops the input (read opcode)
  2. seals it with the position counter (seal opcode = the hidden cipher)
  3. XORs the result into r12 — the "curse token"

After processing N inputs, r12 = XOR over i of cipher(input_i, i).
The server verifies this token alongside the input sequence in the
death-request. Without running the VM correctly, the player can't
produce r12.

Opcodes:
  0 movi A B    reg[A] = B
  1 add  A B    reg[A] += reg[B]
  2 xor  A B    reg[A] ^= reg[B]
  3 rotl A B    reg[A] = rotl(reg[A], B)
  4 jmp  _ B    pc = B*3 + 128
  5 jz   A B    if reg[A]==0  pc = B*3 + 128
  6 read A _    reg[A] = pop_input()  (returns -2 → blocked, no advance)
  7 seal A B    reg[A] = curse(reg[A], reg[B])
  8 halt
"""
import sys

KEY = int(sys.argv[1], 0) & 0xFF if len(sys.argv) > 1 else 0xA6

prog = []
def emit(op, a, b): prog.append(bytes([op, a & 0xFF, b & 0xFF]))

# r0  = position counter (0, 1, 2, ...)
# r1  = current input
# r12 = curse token accumulator
# r2  = constant 1 (incrementer)

emit(0, 0,  0)          # 0 : movi r0, 0      ;  position = 0
emit(0, 12, 0)          # 1 : movi r12, 0     ;  curse = 0
emit(0, 2,  1)          # 2 : movi r2, 1      ;  one
# loop @ pc index 3 (= byte 137 in mem; bytecode_base=128, so jmp target b=3 → 128+9 = 137)
emit(6, 1,  0)          # 3 : read r1, _      ;  blocks until input arrives
emit(7, 1,  0)          # 4 : seal r1, r0     ;  r1 = cipher(input, position)
emit(2, 12, 1)          # 5 : xor r12, r1     ;  curse ^= cipher(...)
emit(1, 0,  2)          # 6 : add r0, r2      ;  position += 1
emit(4, 0,  3)          # 7 : jmp loop        ;  back to instruction 3
emit(8, 0,  0)          # 8 : halt (unreachable)

raw = b"".join(prog)
xor = bytes([b ^ KEY for b in raw])
sys.stdout.buffer.write(xor)
