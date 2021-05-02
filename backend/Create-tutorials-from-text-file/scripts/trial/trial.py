import fitz
import os
prefix = '../static/'

def parseimage(filename, id):
    os.mkdir(prefix+str(id))
    doc = fitz.open(filename)
    pic_location=prefix+str(id)+"/"
    for i in range(len(doc)):
        for img in doc.getPageImageList(i):
            print("img found in ",i)
            xref = img[0]
            pix = fitz.Pixmap(doc, xref)
            if pix.n < 5:       # this is GRAY or RGB
                pix.writePNG(pic_location+"p%s-%s.png" % (i, xref))
            else:               # CMYK: convert to RGB first
                pix1 = fitz.Pixmap(fitz.csRGB, pix)
                pix1.writePNG(pic_location+"p%s-%s.png" % (i, xref))
                pix1 = None
            pix = None
parseimage('D:\\College\\Intel\\Searching a video database using natural language queries.pdf',2)