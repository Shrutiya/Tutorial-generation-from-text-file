from xml.dom import minidom
import tex
from somewhere import mystyle

dom = minidom.parse("myfile.xml")
dvi = tex(mystyle, dom)