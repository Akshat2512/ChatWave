
interface gifProps{
    translateX: number ;
    translateY: number ;
    rotate: string;
    scale: number;
    flip: boolean;
}
  
export interface fontProp{
    text: string;
    bgColor: string;
    fontFamily: string;
    color: string;
    size: number; 
}
  
export interface ChatListProp{
    id: number, 
    sender: string,
    uri: string | null, 
    font: fontProp | null, 
    transform: gifProps,
    time: string
  }
  

