#!/usr/bin/env python

# glyphs file is created by a lttle grep and cut on the css file
# for instance, to get the names of all the glyphs in fontawesome, 
# I used `grep $\.fa fontawesome.css | cut -f1 -d: > glyphs
# Had to chop off the first few, since they were false positives from
# the grep, but you get the idea, I'm sure.

file_path = "glyphs"  # Replace with the actual path to your file

try:
    with open(file_path, 'r') as file:
        for line in file:
            # Process each line here
            g = line.strip()[1:]
            print('  <div class="preview">')
            print('    <span class="inner">')
            # Change the "bi" to whatever you need, like "fa" or "bx"
            print(f"        <i class=\"bi {g}\"></i>")
            print("    </span>")
            print("    <br>")
            print(f"    <span class=\"label\">{g}</span>") 
            print("  </div>")
            print("")
except FileNotFoundError:
    print(f"Error: The file '{file_path}' was not found.")
except Exception as e:
    print(f"An error occurred: {e}")

# Wrap a little more HTML around this, and voila!  Cheatsheet!

