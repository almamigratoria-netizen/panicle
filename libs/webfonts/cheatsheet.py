#!/usr/bin/env python

file_path = "glyphs"  # Replace with the actual path to your file

try:
    with open(file_path, 'r') as file:
        for line in file:
            # Process each line here
            g = line.strip()[1:]
            print('  <div class="preview">')
            print('    <span class="inner">')
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


