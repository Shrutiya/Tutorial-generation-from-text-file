import fitz
def get_images(pgno,pic_location,doc):
  list_images=[]
  for imgno,img in enumerate(doc.getPageImageList(pgno)):
      print("img found in ",pgno)
      xref = img[0]
      pix = fitz.Pixmap(doc, xref)
      if pix.n < 5:       # this is GRAY or RGB
          pix.writePNG(pic_location+"p%s-%s.png" % (pgno, imgno))
      else:               # CMYK: convert to RGB first
          pix1 = fitz.Pixmap(fitz.csRGB, pix)
          pix1.writePNG(pic_location+"p%s-%s.png" % (pgno, imgno))
          pix1 = None
      pix = None  
      list_images.append("<img> p%s-%s.png" % (pgno, imgno))
  return list_images

document = 'Searching a video database using Natural Language Queries.pdf'
doc = fitz.open(document)
print(get_images(4,'/trial',doc))