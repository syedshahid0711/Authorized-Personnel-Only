import zipfile
import xml.etree.ElementTree as ET
import sys

def read_docx(path):
    try:
        with zipfile.ZipFile(path) as docx:
            xml_content = docx.read('word/document.xml')
        tree = ET.fromstring(xml_content)
        # The namespace for Word XML
        ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        # Find all text nodes
        paragraphs = []
        for p in tree.findall('.//w:p', ns):
            texts = [node.text for node in p.findall('.//w:t', ns) if node.text]
            if texts:
                paragraphs.append(''.join(texts))
        
        print('\n'.join(paragraphs))
    except Exception as e:
        print(f"Error reading docx: {e}")

if __name__ == '__main__':
    if len(sys.argv) > 1:
        read_docx(sys.argv[1])
    else:
        print("Provide a path")
