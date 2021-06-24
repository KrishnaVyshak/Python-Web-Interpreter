import * as xtermAddonFit from "https://cdn.skypack.dev/xterm-addon-fit@0.4.0";
import xterm from "https://cdn.skypack.dev/xterm@4.9.0";
window.languagePluginUrl = "https://cdn.jsdelivr.net/pyodide/v0.16.1/full/";
const { FitAddon } = xtermAddonFit;
const { Terminal } = xterm;
const log = (...args) => console.log(...args);
let ready = false;
const term = new Terminal();
//window.term = term;
const fitAddon = new FitAddon();
term.loadAddon(fitAddon);
const onResize = () => {
  fitAddon.fit();
};
term.open(document.body);
onResize();
window.onresize = onResize;
function format(fmt) {var _fmt;
  var re = /(%?)(%([jds]))/g,
  args = Array.prototype.slice.call(arguments, 1),
  fmt = ((_fmt = fmt) === null || _fmt === void 0 ? void 0 : _fmt.toString()) || "";
  if (args.length) {
    fmt = fmt.replace(re, function (match, escaped, ptn, flag) {
      var arg = args.shift();
      switch (flag) {
        case 's':
          arg = '' + arg;
          break;
        case 'd':
          arg = Number(arg);
          break;
        case 'j':
          arg = JSON.stringify(arg);
          break;}

      if (!escaped) {
        return arg;
      }
      args.unshift(arg);
      return match;
    });
  }
  if (args.length) {
    fmt += ' ' + args.join(' ');
  }
  fmt = fmt.replace(/%{2,2}/g, '%');
  return '' + fmt;
}
const write = (...args) => term.write(format(...args).replace(/\n/g, '\r\n'));
const writeln = (...args) => term.writeln(format(...args).replace(/\n/g, '\r\n'));

const pressed = {};
const isDown = key => {
  if (pressed[key]) return true;
  return false;
};
//.replace(/\n/g,'\r\n')
let bracketComplete = true;
let multiLine = false;
let curCode = '';
const willBreakeLine = () => {
  const openP = [];
  let done = true;
  for (let i = 0; i < curCode.length; i++) {
    switch (curCode[i]) {
      case '(':
        openP.push(0);
        break;
      case '{':
        openP.push(1);
        break;
      case '[':
        openP.push(2);
        break;
      case ')':
        if (openP[openP.length - 1] === 0) openP.pop();else
        return false;
        break;
      case '}':
        if (openP[openP.length - 1] === 1) openP.pop();else
        return false;
        break;
      case ']':
        if (openP[openP.length - 1] === 1) openP.pop();else
        return false;
        break;
      default:
        break;}

  }
  if (openP.length === 0) {
    if (curCode[curCode.length - 1] === ':') return true;
    return false;
  }
  return true;
};

term.attachCustomKeyEventHandler(async e => {
  if (!ready) return null;
  if (e.type == 'keyup') pressed[e.key] = false;else
  if (e.type == 'keydown') pressed[e.key] = true;
});
term.onKey(async e => {
  if (isDown('Enter')) {
    if (isDown('Shift') || willBreakeLine()) {
      //multi-line script
      multiLine = true;
      curCode += '\n';
      term.write('\n\r... ');
    } else {
      if (multiLine === true) {
        //when multi-line code is completed
        //this looks dirty tho
        if (curCode[curCode.length - 1] == '\n') multiLine = false;else
        {
          curCode += '\n';
          term.write('\r\n... ');
          return 0;
        }
      }
      term.write('\r\n');
      if (curCode.length === 0) {
        term.write('>>> ');
        return 0;
      }
      /*
      await pyodide.runPythonAsync(curCode,alert,writeln).then(writeln).catch(writeln)
      curCode = ''
      term.write('\r\n>>> ')
      */
      try {
        log('executing: \n', curCode);
        write(pyodide.runPython(curCode));
      } catch (e) {
        write(e);
      } finally {
        curCode = '';
        term.write('\r\n>>> ');
      }
    }
    return 0;
  } else if (e.domEvent.key === 'Backspace') {
    if (term.buffer.active.cursorX > 4) {
      curCode = curCode.substring(0, curCode.length - 1);
      term.write('\x1b[D \x1b[D');
    }
    return 0;
  }
  switch (e.domEvent.key) {
    case 'ArrowRight':
      //right arrow
      //term.write('\x1b[C')
      break;
    case 'ArrowLeft':
      //term.write('\x1b[D')
      break;
    case 'ArrowUp':
      //term.write('\x1b[D')
      break;
    case 'ArrowDown':
      //term.write('\x1b[D')
      break;
    default:
      term.write(e.key);
      curCode += e.key;
      break;}

});


const main = async () => {
  writeln(`
\x1b[96m          .?77777777777777$.            
\x1b[96m          777..777777777777$+           
\x1b[96m         .77    7777777777$$$           
\x1b[96m         .777 .7777777777$$$$           
\x1b[96m         .7777777777777$$$$$$           
\x1b[96m         ..........:77$$$$$$$           
\x1b[96m  .77777777777777777$$$$$$$$$.\x1b[93m=======.  
\x1b[96m 777777777777777777$$$$$$$$$$.\x1b[93m========  
\x1b[96m7777777777777777$$$$$$$$$$$$$.\x1b[93m========= 
\x1b[96m77777777777777$$$$$$$$$$$$$$$.\x1b[93m========= 
\x1b[96m777777777777$$$$$$$$$$$$$$$$ :\x1b[93m========+.
\x1b[96m77777777777$$$$$$$$$$$$$$+.\x1b[93m.=========++~
\x1b[96m777777777$$..\x1b[93m~=====================+++++
\x1b[96m77777777$~.\x1b[93m~~~~=~=================+++++.
\x1b[96m777777$$$.\x1b[93m~~~===================+++++++.
\x1b[96m77777$$$$.\x1b[93m~~==================++++++++: 
\x1b[96m 7$$$$$$$.\x1b[93m==================++++++++++. 
\x1b[96m .,$$$$$$.\x1b[93m================++++++++++~.  
         .=========~.........           
         .=============++++++           
         .===========+++..+++           
         .==========+++.  .++           
          ,=======++++++,,++,           
          ..=====+++++++++=.            
                ..~+=...                     
                \x1b[0m
Preparing python interpreter. Please wait...\n`);
  await languagePluginLoader;
  pyodide.loadPackage('foolscript');
  pyodide.loadPackage('micropip');
  pyodide.loadPackage('numpy');
  pyodide.globals.print = (...arg) => {
    arg.pop();
    log(...arg);
    writeln(...arg);
  };
  ready = true;
  pyodide.runPython(`
import sys
print('Python '+sys.version)
`);
  term.write('\r\n>>> ');
};
main();
