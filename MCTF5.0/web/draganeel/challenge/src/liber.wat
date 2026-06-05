;; ──────────────────────────────────────────────────────────────────
;;  liber.wat — the demon's soul.
;;
;;  WHAT IS PUBLIC  (exported, callable from JS):
;;    - step(pc) -> i32         drives the bytecode interpreter
;;    - read_reg(i), write_reg, push_input, bytecode_base
;;    - iced_shell(x)           DECOY — looks like an LCG step
;;    - fairy_glitter(a, b)     DECOY — looks like a Feistel half
;;
;;  WHAT IS PRIVATE  (no export, only callable via the VM):
;;    The cipher used by the server to encrypt shed-scale frames.
;;    It is opcode 0x07 ($sealOp) inside the dispatch. The bytecode
;;    invokes it on each round to produce a per-step "curse token"
;;    placed in r15. The death-request *requires* this token.
;;    Players who don't trace the VM step-by-step can't recover it.
;;
;;  Memory:
;;    bytes  0.. 63  — 16 × 4-byte registers
;;    bytes 64..127  — input ring buffer (32 × 2-byte slots, head at 0)
;;    bytes  128..   — bytecode (de-XOR'd from memories.bin)
;; ──────────────────────────────────────────────────────────────────
(module
  (memory (export "memory") 16)

  ;; ─── decoy 1: iced_shell ─────────────────────────────────────
  (func $iced_shell (export "iced_shell") (param $x i32) (result i32)
    (i32.and
      (i32.add (i32.mul (local.get $x) (i32.const 1103515245))
               (i32.const 12345))
      (i32.const 0xFFFF)))

  ;; ─── decoy 2: fairy_glitter ──────────────────────────────────
  (func $fairy_glitter (export "fairy_glitter") (param $a i32) (param $b i32) (result i32)
    (i32.and
      (i32.xor (local.get $a) (i32.shl (local.get $b) (i32.const 5)))
      (i32.const 0xFFFF)))

  ;; ─── input ring buffer ───────────────────────────────────────
  (func $push_input (export "push_input") (param $v i32)
    ;; head pointer at byte 64 (low 8 bits = head index)
    (local $h i32)
    (local.set $h (i32.load8_u (i32.const 64)))
    (i32.store16
      (i32.add (i32.const 66) (i32.shl (local.get $h) (i32.const 1)))
      (local.get $v))
    (i32.store8 (i32.const 64)
      (i32.and (i32.add (local.get $h) (i32.const 1)) (i32.const 31))))

  (func $pop_input (result i32)
    ;; tail pointer at byte 65
    (local $t i32) (local $h i32) (local $v i32)
    (local.set $t (i32.load8_u (i32.const 65)))
    (local.set $h (i32.load8_u (i32.const 64)))
    (if (i32.eq (local.get $t) (local.get $h))
      (then (return (i32.const -1))))     ;; empty
    (local.set $v
      (i32.load16_u
        (i32.add (i32.const 66) (i32.shl (local.get $t) (i32.const 1)))))
    (i32.store8 (i32.const 65)
      (i32.and (i32.add (local.get $t) (i32.const 1)) (i32.const 31)))
    (local.get $v))

  ;; ─── VM dispatch ─────────────────────────────────────────────
  ;; Opcodes:
  ;;   0 movi  reg[a] = b
  ;;   1 add   reg[a] += reg[b]
  ;;   2 xor   reg[a] ^= reg[b]
  ;;   3 rotl  reg[a] = rotl(reg[a], b)
  ;;   4 jmp   pc = b * 3 + 128
  ;;   5 jz    if reg[a]==0  pc = b*3 + 128
  ;;   6 read  reg[a] = pop_input()  (returns -1 if buffer empty; bytecode loops on -1)
  ;;   7 seal  reg[a] = curse(reg[a], reg[b])      ← THE CIPHER, hidden here
  ;;   8 halt
  (func $step (export "step") (param $pc i32) (result i32)
    (local $op i32) (local $a i32) (local $b i32)
    (local.set $op (i32.load8_u (local.get $pc)))
    (local.set $a  (i32.load8_u (i32.add (local.get $pc) (i32.const 1))))
    (local.set $b  (i32.load8_u (i32.add (local.get $pc) (i32.const 2))))

    block $end
      block $halt
        block $seal
          block $read
            block $jz
              block $jmp
                block $rotl
                  block $xor_
                    block $add_
                      block $movi
                        (br_table 0 1 2 3 4 5 6 7 8 (local.get $op))
                      end ;; movi
                      (i32.store
                        (i32.shl (local.get $a) (i32.const 2))
                        (local.get $b))
                      br $end
                    end ;; add_
                    (i32.store
                      (i32.shl (local.get $a) (i32.const 2))
                      (i32.add
                        (i32.load (i32.shl (local.get $a) (i32.const 2)))
                        (i32.load (i32.shl (local.get $b) (i32.const 2)))))
                    br $end
                  end ;; xor_
                  (i32.store
                    (i32.shl (local.get $a) (i32.const 2))
                    (i32.xor
                      (i32.load (i32.shl (local.get $a) (i32.const 2)))
                      (i32.load (i32.shl (local.get $b) (i32.const 2)))))
                  br $end
                end ;; rotl
                (i32.store
                  (i32.shl (local.get $a) (i32.const 2))
                  (i32.rotl
                    (i32.load (i32.shl (local.get $a) (i32.const 2)))
                    (local.get $b)))
                br $end
              end ;; jmp
              (return
                (i32.add (i32.const 128)
                  (i32.mul (local.get $b) (i32.const 3))))
            end ;; jz
            (if (i32.eqz (i32.load (i32.shl (local.get $a) (i32.const 2))))
              (then (return
                (i32.add (i32.const 128)
                  (i32.mul (local.get $b) (i32.const 3))))))
            br $end
          end ;; read
          ;; reg[a] = pop_input(); if reg[a] == -1, halt this tick (pc unchanged)
          (i32.store
            (i32.shl (local.get $a) (i32.const 2))
            (call $pop_input))
          (if (i32.eq (i32.load (i32.shl (local.get $a) (i32.const 2)))
                      (i32.const -1))
            (then (return (i32.const -2))))     ;; -2 = blocked, retry later
          br $end
        end ;; seal — THE CIPHER  reg[a] = curse(reg[a], reg[b])
        (local.set $op
          (i32.and
            (i32.xor
              (i32.load (i32.shl (local.get $a) (i32.const 2)))
              (i32.mul (i32.load (i32.shl (local.get $b) (i32.const 2)))
                       (i32.const 0x9E37)))
            (i32.const 0xFFFF)))
        (local.set $op
          (i32.and (i32.mul (local.get $op) (i32.const 0xCE6D))
                   (i32.const 0xFFFF)))
        (local.set $op
          (i32.and
            (i32.or (i32.shl   (local.get $op) (i32.const 7))
                    (i32.shr_u (local.get $op) (i32.const 9)))
            (i32.const 0xFFFF)))
        (i32.store
          (i32.shl (local.get $a) (i32.const 2))
          (i32.and (local.get $op) (i32.const 0xFF)))
        br $end
      end ;; halt
      (return (i32.const -1))
    end
    (i32.add (local.get $pc) (i32.const 3))
  )

  ;; ─── memory accessors for JS ────────────────────────────────
  (func (export "read_reg")  (param $i i32) (result i32)
    (i32.load (i32.shl (local.get $i) (i32.const 2))))
  (func (export "write_reg") (param $i i32) (param $v i32)
    (i32.store (i32.shl (local.get $i) (i32.const 2)) (local.get $v)))
  (func (export "bytecode_base") (result i32) (i32.const 128))
)
