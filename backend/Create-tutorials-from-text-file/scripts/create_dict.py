import copy
class Node:
    def __init__(self, heading_tag, content, pg_no, parent, audio_link):
        self.heading = heading_tag
        self.content = content
        self.pg = pg_no
        self.parent = parent
        self.audio_link = audio_link
        self.children = []

def form_node1(heading_tag,content,pg_no):
  heading_tag=heading_tag
  content=content
  pg_no=pg_no
  parent=''
  audio_link=''
  return Node(heading_tag,content,pg_no,parent,audio_link)

def modified_dict(hierarchy, result, index):
    unacceptable = ['contents','content','table of content','references','table of contents','bibliography','acknowledgement']
    for element in hierarchy:
        if element.heading[1]=='h' and element.content.lower() not in unacceptable:
            new_element=form_node1(element.heading,element.content,index[0])
            new_element.children=fill_children(element.children[::-1])
            # print(element.content, new_element.__dict__)
            result[index[0]]=new_element
            index[0]+=1
            modified_dict(element.children[::-1], result, index)
            if not new_element.children:
                x=len(element.children)
                result[new_element.pg].children.append(form_node1("<p>","Contents:",new_element.pg))
                result[new_element.pg].children.append(form_node1("<p>","--------------------------------------------------------------------------------------------------------------",new_element.pg))
                for i in range(new_element.pg+1,index[0]):
                    #result[new_element.pg].content+=(result[i].content+"\n")
                    result[new_element.pg].children.append(form_node1("<p>",result[i].content,new_element.pg))
                # for i in range(new_element.pg+1,index[0]):
                #     del result[i]
                #index[0]=new_element.pg+1

def fill_children(children):
    final=[]
    for child in children:
        if child.heading[1]!="h":
            final.append(child)
        else:
            break
    return final
