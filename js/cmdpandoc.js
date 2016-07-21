function convertFile() {
  var vHash = {};
  if (vHashTPL) {
    console.log("vHashTPL exists!");
  } else {
    console.log("Error: vHashTPL does not exist");
  }
  if (convertChecker(vHash,vHashTPL)) {
    saveTitleAuthor();
    //alert("saveTitleAuthor() finished");
    runPandocShell(vHash);
  };
};
function runPandocShell(pHash) {
  initShellScript(pHash);
  var vID = ["inputFORMAT","inputFILE","outputFILE","bibFILE","cslFILE","mathjaxDIR","revealDIR"];
  for (var i=0;i<vID.length;i++) {
    pHash[vID[i]] = getValueDOM(vID[i]);
  };
  pHash["inputDIR"] = getPath4Filename(getInnerHTML("inputFILE"));

  //alert("runPandocShell(pHash) now execute "+pHash["inputFILE"]);
  executePanDocCMD(pHash);
};

function initShellScript(pHash) {
  var vPath = getPath4Filename(pHash["inputFILE"]);
  pHash['filename'] = vPath + "/callpandoc.sh";
  pHash['commands'] = "#!/bin/sh";
  pHash['savefile'] = "N";
  if (getOperatingSystem() == "Windows") {
    pHash['filename'] = vPath + "\\callpandoc.bat";
    pHash['commands'] = "@echo off\necho 'PanDoc Command Batch File'";
  };
  pHash["executeable"] = "";
  pHash["paramarray"] = [];
  pHash['commands'] += "\ncd "+vPath;
};

function saveShellScript(pShellHash) {
  //get ProjectPath if the path is defined
  var vPath = getPath4Filename(pShellHash["inputFILE"]);
  //vFileName is the filename of the shell script "cmdpandoc.sh" that will
  // be created in addition to executing the pandoc and image magick commands.
  var vFileName = pShellHash["filename"];
  //save script to filename in pShellHash
  //alert("COMMANDS:\n"+pShellHash["commands"]);
  if (typeof vFilename === 'undefined' || !vFilename) {
    pShellHash['filename'] = vPath + "/callpandoc.sh";
    pShellHash["savefile"] = "Y";
    if (getOperatingSystem() == "Windows") {
      pShellHash['filename'] = vPath + "\\callpandoc.bat";
    };
    vFileName = pShellHash["filename"];
  };
  if (!(pShellHash["commands"])) {
    alert("pShellHash[commands] were undefined!");
    pShellHash['commands'] = "#!/bin/sh";
    if (getOperatingSystem() == "Windows") {
      pShellHash['commands'] = "@echo off\necho 'PanDoc Command Batch File'";
    };
    pShellHash['commands'] += "\ncd "+vPath;
  };
  if (pShellHash["savefile"] != "N") {
    saveFile(vFileName,pShellHash["commands"]);
    alert("PanDoc-Script: "+vFileName+" saved");
  }
};

function isChecked(pID) {
  var vCheckBox = document.getElementById(pID);
  var vReturn = false;
  if (vCheckBox) {
    vReturn = vCheckBox.checked
  } else {
      console.log("ERROR: Checkbox ["+pID+"] is undefined");
  };
  return vReturn;
}

function executePanDocCMD(pHash) {
  var vProjectDir = getPathFromFilename(pHash["inputFILE"]);
  process.chdir(vProjectDir);
  initShellScript(pHash);
  var vInputFilter = "";
  var vAdditionParams = "";
  if (isChecked("inputFILTERUSE")) {
    vInputFilter = getValueDOM("inputFILTER");
  };
  if (isChecked("inputPARAMSUSE")) {
    vAdditionParams = " "+getValueDOM("inputPARAMS")+" " || " ";
  };
  var vShellHash = pHash;
  var vPandoc_CMD = getValueDOM("pandocCMD");
  vPandoc_CMD = replaceString(vPandoc_CMD,"\n","");
  var vInFORMAT  = pHash["inputFORMAT"];
  var vOutFORMAT = pHash["outputFORMAT"];
  var vPanOutFORMAT = pHash["pandocOUTFORMAT"];
  if ((vOutFORMAT != "pdf") && (vOutFORMAT != "audioslides")){
    pHash["savefile"] = "Y";
    pushArgsCMD(pHash,"-f");
    pushArgsCMD(pHash,vInFORMAT+vInputFilter);
    pushArgsCMD(pHash,"-t");
    pushArgsCMD(pHash,vPanOutFORMAT);
  };
  var vCMD_pre = vPandoc_CMD+" -f "+vInFORMAT+vInputFilter;
  var vCMD = vPandoc_CMD+" -f "+vInFORMAT+vInputFilter+" -t "+vPanOutFORMAT;
  var vCMD_post = " " + vAdditionParams;
  vCMD_post += " "+pHash["inputFILE"]+" -o "+pHash["outputFILE"];
  vCMD_post += getBibCMD(pHash);
  vCMD_post += getTitleAuthorCMD(pHash);
  vCMD += vCMD_post;
  pHash["executeable"] = vPandoc_CMD;
  switch (vOutFORMAT) {
    case "audioslides":
      //-----CONVERT AUDIOSLIDES-------
      var vCount = getValueDOM("slidecount")
      var vInputPDF = getInnerHTML("inputFILE");
      if (vInFORMAT == "pdf") {
        //alert("Input Format is PDF ");
        pHash["savefile"] = "Y";
        convertPDF2PNG(vInputPDF,vCount,pHash);
      } else {
        var vMSG = "No PDF-Input:\n Please copy your slides into folder '/images' of your project";
        vMSG += "\n(e.g. img0.png for title slide img1.png for first slide,...)";
        vMSG += "\nIf you select 16 Slides, title slide is 'img0.png' and last image is 'img15.png'.";
        vMSG += "\nYou can use LibreOffice HTML-Export into '/images' to create the files 'img0.png',...";
        alert(vMSG);
      };
      createImageSlide(pHash["outputFILE"],vCount,pHash["template"]);
    break;
    case "latex":
      runShellCommand(vCMD,vShellHash);
      console.log(vCMD);
      alert("PanDoc Processing for Format '"+vOutFORMAT+"' done!");
    break;
    case "html":
      var vSep = getPathSeparator();
      copyFile(pHash["reference"],vProjectDir+vSep+"pandoc.css");
      pushArgsCMD(pHash,"-s");
      pushArgsCMD(pHash,"-S");
      pushArgsCMD(pHash,"-c");
      pushArgsCMD(pHash,"pandoc.css");
      vCMD += " -s -S -c pandoc.css";
      runShellCommand(vCMD,vShellHash);
      console.log(vCMD);
      alert("PanDoc Processing for Format '"+vOutFORMAT+"' done!");
    break;
    case "pdf":
       vCMD = vCMD_pre + " --latex-engine=xelatex " + vCMD_post;
       //vCMD += " --template=\""+pHash["template"]+"\"";
       runShellCommand(vCMD,vShellHash);
       console.log(vCMD);
       alert("PanDoc Processing for Format '"+vOutFORMAT+"' done!");
     break;
    case "odt":
       vCMD += " -S --reference-odt "+pHash["reference"];
       pushArgsCMD(pHash,"-S");
       pushArgsCMD(pHash,"--reference-odt");
       pushArgsCMD(pHash,pHash["reference"]);
       //vCMD += " --template=\""+pHash["template"]+"\"";
       runShellCommand(vCMD,vShellHash);
       console.log(vCMD);
       alert("PanDoc Processing for Format '"+vOutFORMAT+"' done!");
     break;
   case "odt2col":
      vCMD += " -S --reference-odt "+pHash["reference"]
      pushArgsCMD(pHash,"-S");
      pushArgsCMD(pHash,"--reference-odt");
      pushArgsCMD(pHash,pHash["reference"]);
      //vCMD += " --template=\""+pHash["template"]+"\"";
      runShellCommand(vCMD,vShellHash);
      console.log(vCMD);
      alert("PanDoc Processing for Format '"+vOutFORMAT+"' done!");
    break;
    case "docx":
      vCMD += " -S --reference-docx "+pHash["reference"];
      pushArgsCMD(pHash,"-S");
      pushArgsCMD(pHash,"--reference-docx");
      pushArgsCMD(pHash,pHash["reference"]);
      //vCMD += " --template=\""+pHash["template"]+"\"";
      runShellCommand(vCMD,vShellHash);
      console.log(vCMD);
      alert("PanDoc Processing for Format '"+vOutFORMAT+"' done!");
    break;
    case "docx2col":
      vCMD += " -S --reference-docx "+pHash["reference"];
      pushArgsCMD(pHash,"-S");
      pushArgsCMD(pHash,"--reference-docx");
      pushArgsCMD(pHash,pHash["reference"]);
      //vCMD += " --template=\""+pHash["template"]+"\"";
      runShellCommand(vCMD,vShellHash);
      console.log(vCMD);
      alert("PanDoc Processing for Format '"+vOutFORMAT+"' done!");
    break;
    case "dzslides_mathml":
      vCMD += " -s -i --mathml ";
      pushArgsCMD(pHash,"-s");
      pushArgsCMD(pHash,"-i");
      pushArgsCMD(pHash,"--mathml");
      //vCMD += " --template=\""+pHash["template"]+"\"";
      runShellCommand(vCMD,vShellHash);
      console.log(vCMD);
      alert("PanDoc Processing for Format '"+vOutFORMAT+"' done!");
    break;
    case "dzslides":
      pHash["template"] = getInnerHTML("dzslidesTPL");
      //alert("DZSlides TPL:\n"+pHash["template"]);
      //vCMD += " --template="+pHash["template"];
      // pushArgsCMD(pHash,"--template="+pHash["template"]);
      //pushArgsCMD(pHash,"--section-divs");
      // No Quotes around Template allowed
      vCMD += getRevealCMD(pHash);
      // vCMD += " -s ";
      //pushArgsCMD(pHash,"-s");
      vCMD += "-i --mathml ";
      pushArgsCMD(pHash,"-i");
      pushArgsCMD(pHash,"--mathml");
      //vCMD += " --template=\""+pHash["template"]+"\"";
      runShellCommand(vCMD,vShellHash);
      //createDZSlides(pHash["outputFILE"],pHash["template"]);
      setTimeout("createDZSlides('"+pHash["outputFILE"]+"','"+pHash["template"]+"')",2000);
      console.log(vCMD);
      //alert("PanDoc Processing for Format '"+vOutFORMAT+"' done!");
      //openBrowserURL(pHash["outputFILE"]);
    break;
    case "slidy":
      vCMD += " -s -i --webtex ";
      pushArgsCMD(pHash,"-s");
      pushArgsCMD(pHash,"-i");
      pushArgsCMD(pHash,"--webtex");
      //vCMD += " --template=\""+pHash["template"]+"\"";
      runShellCommand(vCMD,vShellHash);
      console.log(vCMD);
      alert("PanDoc Processing for Format '"+vOutFORMAT+"' done!");
    break;
    case "reveal":
        //variable revealjs-url="../../reveal" mathjax-url="../../mathjax"
      vCMD += getRevealCMD(pHash);
      vCMD += getMathJaxCMD(pHash);
      console.log("getRevealCMD() finished");
      vCMD += " --standalone --section-divs";
      // No Quotes around Template allowed
      vCMD += " --template="+pHash["template"];
      pushArgsCMD(pHash,"--standalone");
      pushArgsCMD(pHash,"--section-divs");
      // No Quotes around Template allowed
      pushArgsCMD(pHash,"--template="+pHash["template"]);
      //saveFile()
      console.log("Start PanDoc REVEAL");
      runShellCommand(vCMD,vShellHash);
      console.log(vCMD);
      //var vOutContent = getFileContent(pHash["outputFILE"]);
      //vOutContent = replaceString(vOutContent,"___REVEAL___",pHash["revealCMD"]);
      //vOutContent = replaceString(vOutContent,"___MATHJAX___",pHash["mathjaxCMD"]);
      //saveFile(pHash["outputFILE"],vOutContent);
      //copyFile2Editor("outputEDITOR",pHash["outputFILE"]);
      //write2value("outputEDITOR",vOutContent);
      alert("PanDoc Processing for Format '"+vOutFORMAT+"' done!");
    break;
    default:
      // perform default task
      runShellCommand(vCMD,vShellHash);
      console.log(vCMD);
      alert("PanDoc Processing for Format '"+vOutFORMAT+"' done!");
      //alert("Perform PanDoc Default")
      //alert("pandoc -f "+vInFORMAT+" -t "+vPanOutFORMAT);
  };
  process.chdir(getWorkingDir());
  openConvertedFile();
  saveShellScript(vShellHash);
  callPandoc(vShellHash);
};

function openConvertedFile() {
  if (isChecked("checkOPENCONVERTED")) {
    //open External does not work on Linux;
  };
}
function getWorkingDir() {
  var vCWD = getInnerHTML('currentworkingDIR');
  if (vCWD) {
    vCWD = replaceString(vCWD,"\n","");
  }
  //alert("CWD: "+vCWD);
  return vCWD;
}

function getTitleAuthorCMD(pHash) {
  var vReturn = "";
  var vTitle = getValueDOM("outputTITLE");
  //vTitle = replaceString(vTitle,"\"","''");
  console.log("vTitle='"+vTitle+"'");
  var vAuthor = getValueDOM("outputAUTHOR");
  console.log("vAuthor='"+vAuthor+"'");
  //vAuthor = replaceString(vAuthor,"\"","''");
  if (vTitle != "") {
    vReturn += "  --variable title=\""+vTitle+"\"";
    //pushArgsCMD(pHash,"--variable");
    pushVariableCMD(pHash,"title=\""+vTitle+"\"");
  };
  if (vAuthor != "") {
    vReturn += "  --variable author=\""+vAuthor+"\"";
    //pushArgsCMD(pHash,"--variable");
    pushVariableCMD(pHash,"author=\""+vAuthor+"\"");
  }
  return vReturn;
};

function pushArgsCMD(pHash,pParam) {
  if (typeof(pHash["paramarray"]) == "undefined") {
    pHash["paramarray"] = [];
  };
  pHash["paramarray"].push(pParam);
};

function pushVariableCMD(pHash,pVarContent) {
  pushArgsCMD(pHash,"--variable");
  pushArgsCMD(pHash,pVarContent);
};

function getMathJaxCMD(pHash) {
  //var vReturn = "";
  var vInputDir = pHash["inputDIR"];
  var mathjaxDIR = getMathJaxRelativeDIR();
  pHash["mathjaxCMD"] = mathjaxDIR;
  //vReturn += "  --variable mathjax-url= "+mathjaxDIR;
  pushArgsCMD(pHash,"--mathjax");
  pushVariableCMD(pHash,"mathjaxpath=\""+mathjaxDIR+"\"");
  return "  --mathjax  --variable mathjaxpath=\""+mathjaxDIR+"\"";
  //return "  --mathjax";
};

function getMathJaxRelativeDIR() {
  var vInputDir = getInputFilePath();
  var mathjaxDIR = getInnerHTML("mathjaxDIR");
  if (mathjaxDIR != "") {
    mathjaxDIR = getRelativePath(vInputDir,mathjaxDIR);
  } else {
    mathjaxDIR = "http://cdn.mathjax.org/mathjax/latest";
  };
  return mathjaxDIR;
};

function getRevealRelativeDIR() {
  var vInputDir = getInputFilePath();
  var revealDIR = getInnerHTML("revealDIR");
  if (revealDIR != "") {
    revealDIR = getRelativePath(vInputDir,revealDIR);
  } else {
    revealDIR = "http://lab.hakim.se/reveal-js";
  };
  return revealDIR;
}

function getRevealCMD(pHash) {
  var vReturn = "";
  var revealDIR = getRevealRelativeDIR();
  var vInputDir = pHash["inputDIR"];
  pHash["revealCMD"] = revealDIR;
  pushVariableCMD(pHash,"revealpath=\""+revealDIR+"\"");
  pushVariableCMD(pHash,"theme="+getValueDOM("themeREVEAL"));
  vReturn += "  --variable revealpath=\""+revealDIR+"\"";
  vReturn += "  --variable theme="+getValueDOM("themeREVEAL");
  return vReturn;
};

function getBibCMD(pHash) {
  var bibFILE = pHash["bibFILE"];
  var cslFILE = pHash["cslFILE"];
  var vInputDir = pHash["inputDIR"];
  var vReturn = "";
  var vBibExist
  if (bibFILE != "") {
    if (pHash["outputFORMAT"] == "latex") {
      vReturn += " --natbib"
      pushArgsCMD(pHash,"--natbib");
    };
    bibFILE = getRelativePath(vInputDir,bibFILE);
    vReturn += "  --bibliography  "+bibFILE;
    pushArgsCMD(pHash,"--bibliography");
    pushArgsCMD(pHash,""+bibFILE+"");
    if (cslFILE != "") {
      cslFILE = getRelativePath(vInputDir,cslFILE);
      pushArgsCMD(pHash,"--csl");
      pushArgsCMD(pHash,""+cslFILE+"");
      vReturn += "  --csl "+cslFILE;
    };
  } else {
    if (cslFILE != "") {
      alert("WARNING: CSL Citation Style File defined without defining a BibTeX-File.\nCSL-File is ignored!");
    };
  };
  //alert("getBibCMD(pHash)="+vReturn);
  return vReturn;
}

function convertChecker(pHash,pHashTPL) {
  var vReturn = true;
  //alert("check input set, convertChecker()  pre command exec");
  var vInputFile = getInnerHTML("inputFILE");
  if (!vInputFile) {
    vReturn = false;
    alert("ERROR: PanDoc Input File was not defined!\n    convertChecker():656");
  } else if (vInputFile == "") {
    vReturn = false;
    alert("Error: Input File was not defined!\nCall: convertChecker():659");
  } else {
    pHash["inputFILE"] = vInputFile;
    var vExt = getExtensionOfFilename(vInputFile);
    pHash["Extension"] = vExt;
    vInputFormat = getValueDOM("inputFORMAT");
    pHash["inputFORMAT"] = vInputFormat;
    //alert("Check Format with Extension="+vExt+" inputFORMAT="+pHash["inputFORMAT"]);
    if (vExt !== vExtHash[vInputFormat]) {
      vReturn = confirm("Please check, if input Format ''"+pHash["inputFORMAT"]+"' is correct'!");
    };
    var vOutFormat = getValueDOM("outputFORMAT")
    pHash["outputFORMAT"] = vOutFormat;
    if (pHashTPL[vOutFormat+"TPL"]) {
      pHash["template"] = pHashTPL[vOutFormat+"TPL"]
    } else  {
      var vSep = getPathSeparator();
      pHash["template"] = getMainDir() + vSep+ "tpl"+vSep+"pandoctemplates"+vSep+"default."+vOutFormat;
    };
    console.log("Template: "+pHash["template"]);
    setPandocOutFormat(pHash,pHashTPL);
  };
  console.log("convertChecker() inputFORMAT="+pHash["inputFORMAT"]);
  return vReturn;
}

function setPandocOutFormat(pHash,pHashTPL) {
  var vOutFormat = pHash["outputFORMAT"]
  switch (vOutFormat) {
    case "html":
      pHash["pandocOUTFORMAT"]=vOutFormat;
      pHash["reference"] = pHashTPL[vOutFormat+"REF"];
    break;
    case "odt":
      pHash["pandocOUTFORMAT"]=vOutFormat;
      pHash["reference"] = pHashTPL[vOutFormat+"REF"];
    break;
    case "odt2col":
      pHash["pandocOUTFORMAT"]="odt";
      pHash["reference"] = pHashTPL[vOutFormat+"REF"];
    break;
    case "docx":
      pHash["pandocOUTFORMAT"]=vOutFormat;
      pHash["reference"] = pHashTPL[vOutFormat+"REF"];
    break;
    case "docx2col":
      pHash["pandocOUTFORMAT"]="docx";
      pHash["reference"] = pHashTPL[vOutFormat+"REF"];
    break;
    case "dzslides":
      pHash["pandocOUTFORMAT"]=vOutFormat;
      pHash["reference"] = pHashTPL[vOutFormat+"REF"];
    break;
    case "reveal":
      //pHash["pandocOUTFORMAT"]="revealjs";
      // OutFormat must be html5 otherwise the wrong template will be used
      pHash["pandocOUTFORMAT"]="html5";
    break;
    default:
      //pHash["referenceODT"] = "";
      //pHash["referenceODT"] = "";
      pHash["pandocOUTFORMAT"] = vOutFormat;
  };
}

function createImageSlide(pOutFile,pCount,pTemplate) {
  console.log("Create "+pCount+" AudioSlides for "+pOutFile);
  alert("Create "+pCount+" AudioSlides for "+pOutFile);
  var i = 0;
  var vSep = getPathSeparator();
  //var vPathPrefix = "." + vSep + "images" + vSep + "img";
  var vOutSlides = "";
  var vPresentation = getFileContent (pTemplate);
  //var vSlideTPL     = getFileContent ('tpl/audioslides/defslide.html');
  var vSlideTPL     = getFileContent (getMainDir()+vSep+'tpl'+vSep+'audioslides'+vSep+'defslide.html');
  //alert("after TPL and LOOP with getFileContent()");
  write2value("inputEDITOR",vPresentation);
  write2value("inputLOOP",vSlideTPL);
  //alert("write2value finished");
  var vCount = parseInt(pCount);
  while ((i<vCount) && (i < 200)) {
    vSlide = vSlideTPL;
    vSlide = replaceString(vSlide,"___NR___",i);
    //alert("vSlide="+vSlide);
    vOutSlides +=vSlide;
    i++;
  };
  //write2value("inputLOOP",vOutSlides);
  vPresentation = replaceSlides(vPresentation,vOutSlides);
  //vPresentation =  replaceString(vPresentation,"___DZ_SLIDES___",vOutSlides);
  write2value("outputEDITOR",vPresentation);
  saveFile(getInnerHTML("outputFILE"),vPresentation);
  alert("Convert Finished:\nCopy your audio comments as MP3-File into folder '/audio' of your PanDoc Project!\n(e.g. audio0.mp3 for title slide, audio1.mp3 for slide 1,..." );
};

function replaceSlides(pPresentation,pOutSlides) {
  var vOutSlides = pOutSlides || "Undefined Slides for DZ-Slides";
  var vPresentation =  pPresentation || "Undefined Main Template ___DZ_SLIDES___";
  var revealDIR = getRevealRelativeDIR();
  console.log("Reveal-Dir for  DZSlides for "+revealDIR);
  var mathjaxDIR = getMathJaxRelativeDIR();
  console.log("MathJax-Dir for  DZSlides for "+mathjaxDIR);
  vPresentation =  replaceString(vPresentation,"___DZ_SLIDES___",vOutSlides);
  vPresentation =  replaceString(vPresentation,"___REVEAL___",revealDIR);
  vPresentation =  replaceString(vPresentation,"___MATHJAX___",mathjaxDIR);
  vPresentation =  replaceString(vPresentation,"___THEME___",getValueDOM("themeREVEAL"));
  return vPresentation;
}

function createDZSlides(pOutFile,pTemplate) {
  console.log("Create DZSlides for "+pOutFile);
  //alert("pOutFile='"+pOutFile+"'");
  alert("Create DZSlides with Audio Comments for "+pOutFile);
  var i = 0;
  var vSep = getPathSeparator();
  var vPresentation = getFileContent (pTemplate);
  //alert(vPresentation.substr(0,300));
  var vSlideTPL     = getFileContent (getMainDir()+vSep+'tpl'+vSep+'dzslides'+vSep+'defslide.html');
  var vOutSlides    = getFileContent (pOutFile);
  //alert("vOutSlides:\n"+vOutSlides.substr(0,400));
  //alert("vSlideTPL:\n"+vSlideTPL);
  var vSlideArray = vOutSlides.split("</section>");
  //alert("after TPL and LOOP with getFileContent()");
  //write2value("inputEDITOR",vPresentation);
  write2value("inputLOOP",vSlideTPL);
  //alert("write2value finished");
  vOutSlides = vSlideArray[0];
  i = 1;
  while ((i<vSlideArray.length) && (i < 200)) {
    vSlide = vSlideTPL;
    vSlide = replaceString(vSlide,"___NR___",i);
    //alert("vSlide="+vSlide);
    vOutSlides +=vSlide + vSlideArray[i];
    i++;
  };
  //write2value("inputLOOP",vOutSlides);
  //write2value("inputLOOP",vOutSlides);
  vPresentation = replaceSlides(vPresentation,vOutSlides);
  write2value("outputEDITOR",vPresentation);
  saveFile(pOutFile,vPresentation);
  //saveFile("pOutFile.html",vPresentation);
  //saveTestFile();
  alert("Convert Finished:\nCopy your audio comments as MP3-File into folder '/audio' of your PanDoc Project!\n(e.g. audio0.mp3 for title slide, audio1.mp3 for slide 1,... (Software: e.g. Audacity)" );
};

function convertPDF2PNG(pInputPDF,pCount,pShellHash) {
  var vExt = getExtensionOfFilename(pInputPDF);
  vExt = vExt.toUpperCase();
  if (vExt != "PDF") {
    alert("WARNING: Input file is not an PDF document!");
  } else {
    var vPath = getPathFromFilename(pInputPDF);
    var vSep = getPathSeparator();
    vPath += vSep + "images" + vSep + "img";
    var i = 0;
    var vOutPNG = vPath +i+".png";
    var vCount = parseInt(pCount);
    var vPDFstartpage = parseInt(getValueDOM("PDFstartpage")) || 0;
    alert("Remark: Converting PDF slide "+vPDFstartpage+" to slide "+(vPDFstartpage+vCount-1)+" could take up to "+pCount+" minutes!");
    console.log("convertPDF2PNG(pInputPDF,"+pCount+") with PDF startpage "+vPDFstartpage);
    var vIM_CMD = getValueDOM("imagemagickCMD");
    vIM_CMD = replaceString(vIM_CMD,"\n","");
    while ((i<vCount) && (i < 200)) {
      vOutPNG = vPath +i+".png";
      vPDFpage = i + vPDFstartpage;
      //vNode.value += ">";
      //setTimeout("document.getElementById('pandocprogress').value += 'o'",100);
      //alert("Create Image "+i+" from PDF");
      // convert -density 300 -depth 8 -quality 85 ${FilePDF}[${COUNTER}] outtmp.png
      var vCMD = vIM_CMD+" -density 300 -depth 8 -quality 85 "+pInputPDF+"["+vPDFpage+"] " + vOutPNG;
      pShellHash["executeable"] = vIM_CMD;
      pShellHash["paramarray"] = ["-density","300", "-depth","8", "-quality","85", pInputPDF+"["+i+"]", vOutPNG];
      //alert(vCMD);
      runShellCommand(vCMD,pShellHash);
      i++;
    };
    alert("Generating "+pCount+" PNG Files from PDF done!");
  }
}
// The following hash defines the extension for the Output Format
