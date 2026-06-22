# NDA boundary

This harness is the public, fictional-substrate version of a method I first used on real client work that
stays behind its NDA. The line is drawn the same way as the other harnesses in this folder.

**Public (everything in this directory):**
- The method: hold the input fixed, repeat the grading call, count verdict flips.
- The defect taxonomy: NDV, VTD, CFR, ALR, and the stochastic-vs-deterministic split.
- The fictional domain (Vendari), the probe, the deterministic scorer, and every number it produces.

**Behind the NDA (never here):**
- The real program, platform, items, rubrics, and any client identity.
- The real grader's model and configuration.
- The real flip rates and drift numbers measured on the live system. Those belong to the program. The
  magnitudes here come from a local model on invented items and stand in for nothing but themselves.

The rule across this folder: the machine is public, the client's data is not. A reader gets the instrument
and can run it on their own grader. They never get anyone's bank.
