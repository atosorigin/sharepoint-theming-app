var theWindow=$(window),aspectRatio,$bg,bg,currentTime,currentMilliSecond,totalCycleTime,totalCyclesPassed,restCycleTime,currentCycle,currentCycleRestPercentage,currentCycleRest,intervalNumber,nextCycle,aspectRatioNew,$bgnew,bgnew,bgstarted,bgWidth,bgWidthNew,slideDebug="",aspectRatio=0,aspectRatioNew=0,bgstarted=false,bgWidth=true,bgWidthNew=true;

function setCurrentCycle(){
currentTime=new Date();
currentMilliSecond=(currentTime.getMinutes()*60+currentTime.getSeconds())*1000;
var A=parseInt(slideArray.length);
totalCycleTime=slideInterval*A;
totalCyclesPassed=parseInt(currentMilliSecond/totalCycleTime);
currentCycleTime=currentMilliSecond-(totalCyclesPassed*totalCycleTime);
currentCycle=parseInt(currentCycleTime/slideInterval);
currentCycleRestPercentage=parseFloat(currentCycleTime/slideInterval)-currentCycle;
currentCycleRest=parseFloat(slideInterval-currentCycleRestPercentage*slideInterval).toFixed(0);
if(currentCycle>=A-1)
{
  nextCycle=0
}
else{
  nextCycle=currentCycle+1
}
}

function bgLoadNew()
{
aspectRatioNew=$bgnew.width()/$bgnew.height();
resizeBgNew();
timeout=setTimeout(bgFade,currentCycleRest)
}

function bgLoad()
{
aspectRatio=$bg.width()/$bg.height();
resizeBg();
$bg.fadeIn();
bgSlide()
}

function resizeBg()
{
var A=$(window).width()/$(window).height();
if(A>aspectRatio&&!bgWidth)
{
  $bg.css("width","100%").css("height","");
  bgWidth=true
} 
else
{
  if(A<aspectRatio&&bgWidth){
    $bg.css("height","100%").css("width","");
    bgWidth=false
  }
} 

if(bgstarted)
{
  resizeBgNew()
}
}

function resizeBgNew()
{
var A=$(window).width()/$(window).height();
if(A>aspectRatioNew&&!bgWidthNew)
{
  $bgnew.css("width","100%").css("height","");
  bgWidthNew=true
}else
{
  if(A<aspectRatioNew&&bgWidthNew)
  {
    $bgnew.css("height","100%").css("width","");
    bgWidthNew=false
  }
}
bgstarted=true
}

function bgFade(){
$bgnew.fadeIn(slideTransition,function(){
$bg.remove();
$bg=$bgnew;
$bg.addClass("active");
aspectRatio=aspectRatioNew;
bgWidth=bgWidthNew;
setCurrentCycle();
bgSlide()
})
}

function bgSlide(){
$bgnew=$('<img style="width:100%">'),bgnew=$bgnew[0];
bgWidthNew=true;
$bgnew.appendTo("#bgimgwrapper");
$bgnew.hide().load(bgLoadNew);
bgnew.id="bg"+nextCycle;
bgnew.src=slideArray[nextCycle]
}

function bgStart(){
setCurrentCycle();
$bg=$('<img style="width:100%">'),bg=$bg[0];
$bg.hide().load(bgLoad);
$bg.addClass("active");
bg.id="bg"+currentCycle;
bg.src=slideArray[currentCycle];
$bg.appendTo("#bgimgwrapper");
theWindow.resize(resizeBg)
}