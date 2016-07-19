function setInput4Project(pInputID,pOutputID,pExt) {
  var vPathSep = getPathSeparator(); // is on Linux/Mac "/" on Windows "Backslash"
  var vInFormat = getValueDOM("inputFORMAT");
  var vExt = vExtHash[vInFormat];
  //var vExt = pExt || vExtHash[vInFormat];
  var vDefaultFilename = "input";
  var vFilename = document.getElementById(pInputID).value || vDefaultFilename;
  if (vFilename == "") {
    alert("Error ["+pInputID+"]: Input File was undefined!\n  setInput4Project():565:index.html");
  } else {
    //alert("Format: "+vInFormat+" Extension: "+vExt);
    //if (getExtensionOfFilename(vFilename) != "md") {
    //vFilename = removeExtension(vFilename)+".md";
    //alert("Extension is not 'md'. Use filename '"+vFilename+"' instead!");
  };
  //write2value(pOutputID,vFilename);
  //alert("setInput4Project() vFilename:\n"+vFilename);
  var vProjectDir = getProjectDir();
  //alert("vProjectDir="+vProjectDir);
  vFilename = vProjectDir+vPathSep+vFilename+vPathSep+vFilename+"."+vExt;
  console.log('Set Input File: \''+vFilename+'\' to DOM-Node['+pOutputID+']!');
  write2innerHTML(pOutputID,vFilename);
}

function createOutputFile (pInputFile,pOutputFORMAT) {
  var vFileNoExt = removeExtension(pInputFile);
  var vExt = vExtHash[pOutputFORMAT] || pOutputFORMAT;
  return vFileNoExt+"_"+pOutputFORMAT+"."+vExt;
}

function visibleAudioSlideCount(pOutputFORMAT) {
  visibleOutFormatSelectors(pOutputFORMAT);
}
function visibleOutFormatSelectors(pOutputFORMAT) {
  if (pOutputFORMAT == "audioslides") {
    showElement("divSlideCount");
    var vExt = getExtensionOfFilename(getInnerHTML("inputFILE")) || "???";
    if (vExt.toUpperCase()!="PDF") {
      alert("Input File must be PDF!\n(Constraint: Output Format Selector)");
    }
  } else {
    hideElement("divSlideCount");
  };
  if ((pOutputFORMAT == "reveal") || (pOutputFORMAT == "dzslides")) {
    showElement("themeREVEAL");
  } else {
    hideElement("themeREVEAL");
  };
}

function changedWebInput(pChecked) {
  //alert("Changed Web Input");
};
function changedInFormat (pInputFORMAT) {
  //alert("Changed Input Format to "+pInputFORMAT);
  //setInput4Project('inputNEWPROJECT','inputNEWFILE');
  switch (pInputFORMAT) {
    case "pdf":
        // PDF as Input implies audioslides as outputFORMAT
        setOutputFormat("audioslides");
        setInput4Project("inputNEWPROJECT",'inputNEWFILE');
        break;
    case "myformat":
        // handle case
        break;
    default:
      // Default Output Format
      setInput4Project("inputNEWPROJECT",'inputNEWFILE');
  } //end switch
  write2innerHTML("selectInputFORMAT",pInputFORMAT);
}
function autoSelectInputFormat() {
  var vFile = getValueDOM("inputFILE");
  var vExt = getExtensionOfFilename(vFile);
  if (vExt2Format[vExt]) {
    write2value("inputFORMAT",vExt2Format[vExt]);
  };
  if (vExt == "pdf") {
    setOutputFormat("audioslides");
  }
}
function setInputFormat(pInputFORMAT) {
  write2value("inputFORMAT",pInputFORMAT);
};
function changedOutFormat (pOutputFORMAT) {
  //alert("Changed Output Format to "+pOutputFORMAT);
  var vInputFile= getValueDOM("inputFILE");
  if ((!vInputFile) || (vInputFile == "")) {
    alert("Input File is undefined! Please select File\n  changetOutFormat()-Call:377");
  } else {
    //alert("changedOutFormat() vInputFile="+vInputFile);
    var vOutFile = createOutputFile(vInputFile,pOutputFORMAT);
    write2innerHTML("outputFILE",vOutFile);
    switch (pOutputFORMAT) {
      case "audioslides":
          // PDF as Input implies audioslides as outputFORMAT
          setInputFormat("pdf");
          break;
      case "myformat":
          // handle case
          break;
      default:
        // Default Output Format
    } //end switch
  };
  write2value("selectOutputFORMAT",pOutputFORMAT);
  visibleOutFormatSelectors(pOutputFORMAT);
};
function setOutputFormat(pOutputFORMAT) {
  write2value("outputFORMAT",pOutputFORMAT);
  var vInputFile = getValueDOM("inputFILE");
  var vOutFile   = createOutputFile(vInputFile,pOutputFORMAT);
  write2innerHTML("outputFILE",vOutFile);
  visibleAudioSlideCount(pOutputFORMAT);
};
