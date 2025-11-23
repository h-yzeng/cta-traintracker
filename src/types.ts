export interface TrainArrival {
  staId: string;     
  staNm: string;     
  stpId: string;     
  stpDe: string;     
  rn: string;        
  rt: string;         
  destNm: string;   
  arrT: string;    
  isApp: string;    
  isDly: string;     
  lat: string;
  lon: string;
  heading: string;
}

export interface TrainPosition {
  rn: string;         
  destNm: string;   
  nextStaNm: string;  
  lat: string;       
  lon: string;        
  heading: string;    
  isDly: string;
}

export interface RouteInfo {
  id: string;
  name: string;
  color: string;
  textColor: string;
}