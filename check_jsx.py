import re
with open('src/app/(tabs)/calc.tsx', 'r') as f:
    text = f.read()

tags = []
for i, m in enumerate(re.finditer(r'<(/?)([A-Z]\w*)', text)):
    is_close = m.group(1) == '/'
    tag = m.group(2)
    
    # check for self closing
    # find the end of the tag
    end_idx = text.find('>', m.end())
    if text[end_idx-1] == '/':
        continue # self closing
        
    if tag == 'Ionicons' or tag == 'Button' or tag == 'TextInput':
        continue # often self closing, let's just focus on View, Text, ScrollView, SafeAreaView, Pressable
        
    if is_close:
        if not tags:
            print(f"Error: unmatched close tag {tag} at match {i}")
            break
        last_tag = tags.pop()
        if last_tag != tag:
            print(f"Error: unmatched close tag {tag}, expected {last_tag} at match {i}")
            break
    else:
        tags.append(tag)

print("Remaining open tags:", tags)
