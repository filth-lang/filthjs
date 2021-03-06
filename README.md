# Filth

A language loosely based on Forth.


Filth was created by Alexander Veenendaal in the 10s. It is an imperative,
stack-based language and programming environment. It's also not used by NASA.


```filth
# This is a comment
// This is also a comment

# --------------------------------- Precursor ----------------------------------

\ All programming in Filth is done by manipulating the parameter stack (more
\ commonly just referred to as "the stack").
5 2 3 56 76 23 65    # ok

\ Those numbers get added to the stack, from left to right.
.s    \ <7> 5 2 3 56 76 23 65 ok


# ------------------------------ Basic Arithmetic ------------------------------

# Arithmetic (in fact most words requiring data) works by manipulating data on
# the stack.
5 4 +    # ok

# `.` pops the top result from the stack:
.    # 9 ok

# More examples of arithmetic:
6 7 * .        # 42 ok
1360 23 - .    # 1337 ok
12 12 / .      # 1 ok
13 2 mod .     # 1 ok

99 negate .    # -99 ok
-99 abs .      # 99 ok
52 23 max .    # 52 ok
52 23 min .    # 23 ok

# ----------------------------- Stack Manipulation -----------------------------

# Naturally, as we work with the stack, we'll want some useful methods:

3 dup -          # duplicate the top item (1st now equals 2nd): 3 - 3
3 %0 -          # duplicate the top item (1st now equals 2nd): 3 - 3
2 5 $1 /         # swap the top with the second element:        5 / 2
6 4 5 rot .s     # rotate the top 3 elements:                   4 5 6
6 4 5 $2 .s      # rotate the top 3 elements:                   4 5 6
4 0 ~0 2 /     # remove the top item (don't print to screen):  4 / 2
1 2 3 ~1 .s     # remove the second item (similar to drop):    1 3

# ---------------------- More Advanced Stack Manipulation ----------------------

1 2 3 4 %1     # duplicate the second item to the top:             1 2 3 4 3 ok
1 2 3 4 $3     # move the item at that offset to the top:          2 3 4 1 ok

# When referring to stack indexes, they are zero-based.

# ------------------------------ Creating Words --------------------------------

[ dup * ] square define        # ok
5 square .                     # 25 ok

# We can view what a word does too:
*square see    # [ dup * ] ok

# -------------------------------- Conditionals --------------------------------

42 42 ==    # true ok
12 53 ==    # false ok

12 53 !=    # true ok

# `if` is a compile-only word. `if` <stuff to do> `then` <rest of program>.
[ [ "Greater than 64!" ] *%1 64 > if ] ?> define          # ok
100 ?> 64                                                 # Greater than 64! ok


# Else:
[ [ "Less than 64!" ] [ "Greater than 64!" ] *%2 64 > iif ] ?> define

: ?>64 ( n -- n ) dup 64 > if ." Greater than 64!" else ." Less than 64!" then ;
100 ?> 64    # Greater than 64! ok
20 ?> 64     # Less than 64! ok

# ------------------------------------ Loops -----------------------------------

# a loop continues while the last value is true
[ hello! . $i 4 < ] loop # ok
# Hello!
# Hello!
# Hello!
# Hello!
# Hello! ok

# `do` takes an end and start number
# We can get the value of the index as we loop with `i`:
[ $i .] 12 0 do # ok
# 0 1 2 3 4 5 6 7 8 9 10 11 12 ok


# `?do` works similarly, except it will skip the loop if the end and start
# numbers are equal.
[ dup * ] square define # ok
[ [ $i square . ] *$1 0 ?do ] squares define # ok
10 squares


# ---------------------------- Variables and Memory ----------------------------

# use `!` to assign 21 to the `age` variable
21 age !

# print the variable using the $ prefix
$age .     # 21 ok
age @ .    # 21 ok

# Finally we can print our variable using the "read" word `@`, which adds the
# value to the stack, or use `?` that reads and prints it in one go.
age @ .    # 21 ok
age ?      # 21 ok

# Constants are quite similar, except we don't bother with memory addresses:
100 constant WATER-BOILING-POINT    # ok
WATER-BOILING-POINT .               # 100 ok

# ----------------------------------- Arrays -----------------------------------

# Creating arrays is similar to variables, except we need to allocate more
# memory to them.

# You can use `2 cells allot` to create an array that's 3 cells long:
variable mynumbers 2 cells allot    # ok

# Initialize all the values to 0
mynumbers 3 cells erase    # ok

# Alternatively we could use `fill`:
mynumbers 3 cells 0 fill

# or we can just skip all the above and initialize with specific values:
create mynumbers 64 , 9001 , 1337 , # ok (the last `,` is important!)

# ...which is equivalent to:

# Manually writing values to each index:
64 mynumbers 0 cells + !      # ok
9001 mynumbers 1 cells + !    # ok
1337 mynumbers 2 cells + !    # ok

# Reading values at certain array indexes:
0 cells mynumbers + ?    # 64 ok
1 cells mynumbers + ?    # 9001 ok

# We can simplify it a little by making a helper word for manipulating arrays:
: of-arr ( n n -- n ) cells + ;    # ok
mynumbers 2 of-arr ?               # 1337 ok

# Which we can use for writing too:
20 mynumbers 1 of-arr !    # ok
mynumbers 1 of-arr ?       # 20 ok


# ------------------------- Floating Point Operations --------------------------

# Most Filths tend to eschew the use of floating point operations.
8.3e 0.8e f+ f.    # 9.1 ok

# Usually we simply prepend words with 'f' when dealing with floats:
variable myfloatingvar    # ok
4.4e myfloatingvar f!     # ok
myfloatingvar f@ f.       # 4.4 ok

# --------------------------------- Final Notes --------------------------------

# Typing a non-existent word will empty the stack. However, there's also a word
# specifically for that:
cls

# Clear the screen:
page

# Loading Forth files:
# s" forthfile.fs" included

# You can list every word that's in Forth's dictionary (but it's a huge list!):
# words

# Exiting Gforth:
# bye

```

##Ready For More?

* [Starting Forth](http://www.forth.com/starting-forth/)
* [Simple Forth](http://www.murphywong.net/hello/simple.htm)
* [Thinking Forth](http://thinking-forth.sourceforge.net/)