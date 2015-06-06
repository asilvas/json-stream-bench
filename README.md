Benchmark JSON streaming serialization performance.

Short story: JSON Streaming performance sucks, now you know, lets make it better.

## Latest run

If you scroll down to throughput you'll see the bigger picture. Streaming is an order
of magnitude worse than simply doing it via built-in JSON stringify/parse.  
 
```
* Wall Clock (ms):
  JSON                          24021 (base)
    Numerics.read               3001 (base)
    Numerics.write              3001 (base)
    Mixed Types.read            3001 (base)
    Mixed Types.write           3001 (base)
    Heavy Nesting.read          3001 (base)
    Heavy Nesting.write         3001 (base)
    Huge (1MB) Buffer.read      3003 (base)
    Huge (1MB) Buffer.write     3012 (base)
  JSON-delay                    24078 (100%)
    Numerics.read               3003 (100%)
    Numerics.write              3002 (100%)
    Mixed Types.read            3008 (100%)
    Mixed Types.write           3008 (100%)
    Heavy Nesting.read          3010 (100%)
    Heavy Nesting.write         3007 (100%)
    Huge (1MB) Buffer.read      3005 (100%)
    Huge (1MB) Buffer.write     3035 (101%)
  JSONStream                    25487 (106%)
    Numerics.read               3001 (100%)
    Numerics.write              3011 (100%)
    Mixed Types.read            3001 (100%)
    Mixed Types.write           3001 (100%)
    Heavy Nesting.read          3001 (100%)
    Heavy Nesting.write         3001 (100%)
    Huge (1MB) Buffer.read      3102 (103%)
    Huge (1MB) Buffer.write     4369 (145%)
  JSONStream-delay              24146 (101%)
    Numerics.read               3005 (100%)
    Numerics.write              3010 (100%)
    Mixed Types.read            3011 (100%)
    Mixed Types.write           3010 (100%)
    Heavy Nesting.read          3004 (100%)
    Heavy Nesting.write         3010 (100%)
    Huge (1MB) Buffer.read      3072 (102%)
    Huge (1MB) Buffer.write     3024 (100%)

* CPU Clock (ms): *** NOTE: Includes all cpu usage -- run only on idle system
  JSON                          32126 (base)
    Numerics.read               3480 (base)
    Numerics.write              3590 (base)
    Mixed Types.read            3572 (base)
    Mixed Types.write           3447 (base)
    Heavy Nesting.read          4401 (base)
    Heavy Nesting.write         3528 (base)
    Huge (1MB) Buffer.read      3698 (base)
    Huge (1MB) Buffer.write     6410 (base)
  JSON-delay                    31795 (99%)
    Numerics.read               3839 (110%)
    Numerics.write              3385 (94%)
    Mixed Types.read            3603 (101%)
    Mixed Types.write           3309 (96%)
    Heavy Nesting.read          3418 (78%)
    Heavy Nesting.write         3400 (96%)
    Huge (1MB) Buffer.read      6160 (167%)
    Huge (1MB) Buffer.write     4681 (73%)
  JSONStream                    30860 (96%)
    Numerics.read               3650 (105%)
    Numerics.write              4510 (126%)
    Mixed Types.read            3558 (100%)
    Mixed Types.write           3494 (101%)
    Heavy Nesting.read          3541 (80%)
    Heavy Nesting.write         3541 (100%)
    Huge (1MB) Buffer.read      3525 (95%)
    Huge (1MB) Buffer.write     5041 (79%)
  JSONStream-delay              29953 (93%)
    Numerics.read               5429 (156%)
    Numerics.write              3400 (95%)
    Mixed Types.read            3495 (98%)
    Mixed Types.write           3387 (98%)
    Heavy Nesting.read          3448 (78%)
    Heavy Nesting.write         3761 (107%)
    Huge (1MB) Buffer.read      3492 (94%)
    Huge (1MB) Buffer.write     3541 (55%)

* Throughput (KByte/sec):
  JSON                          893957 (base)
    Numerics.read               69506 (base)
    Numerics.write              79169 (base)
    Mixed Types.read            96936 (base)
    Mixed Types.write           56201 (base)
    Heavy Nesting.read          52510 (base)
    Heavy Nesting.write         66686 (base)
    Huge (1MB) Buffer.read      278724 (base)
    Huge (1MB) Buffer.write     194225 (base)
  JSON-delay                    363904 (41%)
    Numerics.read               12 (0%)
    Numerics.write              13 (0%)
    Mixed Types.read            18 (0%)
    Mixed Types.write           18 (0%)
    Heavy Nesting.read          53 (0%)
    Heavy Nesting.write         53 (0%)
    Huge (1MB) Buffer.read      197673 (71%)
    Huge (1MB) Buffer.write     166064 (86%)
  JSONStream                    103364 (12%)
    Numerics.read               4647 (7%)
    Numerics.write              6844 (9%)
    Mixed Types.read            6168 (6%)
    Mixed Types.write           8400 (15%)
    Heavy Nesting.read          12974 (25%)
    Heavy Nesting.write         11729 (18%)
    Huge (1MB) Buffer.read      46422 (17%)
    Huge (1MB) Buffer.write     6180 (3%)
  JSONStream-delay              70574 (8%)
    Numerics.read               13 (0%)
    Numerics.write              13 (0%)
    Mixed Types.read            18 (0%)
    Mixed Types.write           18 (0%)
    Heavy Nesting.read          53 (0%)
    Heavy Nesting.write         53 (0%)
    Huge (1MB) Buffer.read      64454 (23%)
    Huge (1MB) Buffer.write     5952 (3%)

* Avg Event Lag (ms):
  JSON                          31 (base)
    Numerics.read               31 (base)
    Numerics.write              31 (base)
    Mixed Types.read            31 (base)
    Mixed Types.write           31 (base)
    Heavy Nesting.read          31 (base)
    Heavy Nesting.write         31 (base)
    Huge (1MB) Buffer.read      31 (base)
    Huge (1MB) Buffer.write     31 (base)
  JSON-delay                    2 (6%)
    Numerics.read               1 (3%)
    Numerics.write              1 (3%)
    Mixed Types.read            1 (3%)
    Mixed Types.write           1 (3%)
    Heavy Nesting.read          1 (3%)
    Heavy Nesting.write         1 (3%)
    Huge (1MB) Buffer.read      4 (13%)
    Huge (1MB) Buffer.write     4 (13%)
  JSONStream                    36 (116%)
    Numerics.read               40 (129%)
    Numerics.write              31 (100%)
    Mixed Types.read            34 (110%)
    Mixed Types.write           33 (106%)
    Heavy Nesting.read          33 (106%)
    Heavy Nesting.write         31 (100%)
    Huge (1MB) Buffer.read      36 (116%)
    Huge (1MB) Buffer.write     47 (152%)
  JSONStream-delay              5 (16%)
    Numerics.read               1 (3%)
    Numerics.write              1 (3%)
    Mixed Types.read            1 (3%)
    Mixed Types.write           1 (3%)
    Heavy Nesting.read          1 (3%)
    Heavy Nesting.write         1 (3%)
    Huge (1MB) Buffer.read      9 (29%)
    Huge (1MB) Buffer.write     26 (84%)
```