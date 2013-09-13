(function(ui, $, undefined) {
  ui.renderBarcode = function($isotopeItem, barcode) {
    if (barcode.type == null || barcode.value == null) {
      return;
    }
    var elt = symdesc.filter(function(elem, indx) {
      return elem.desc == barcode.type;
    })[0];
    var text = barcode.value.replace(/^\s+/, '').replace(/\s+$/, '');
    var opts = elt.opts;

    var bw = new BWIPJS;

    // Convert the options to a dictionary object, so we can pass alttext with
    // spaces.
    var tmp = opts.split(' ');
    opts = {};
    for (var i = 0; i < tmp.length; i++) {
      if (!tmp[i])
        continue;
      var eq = tmp[i].indexOf('=');
      if (eq == -1)
        opts[tmp[i]] = bw.value(true);
      else
        opts[tmp[i].substr(0, eq)] = bw.value(tmp[i].substr(eq + 1));
    }

    // Add any hard-coded options required to fix problems in the javascript
    // emulation.
    opts.inkspread = bw.value(0);
    if (needyoffset[elt.sym] && !opts.textxalign && !opts.textyalign && !opts.alttext && opts.textyoffset === undefined)
      opts.textyoffset = bw.value(-10);

    var rot = 'N';

    bw.bitmap(new Bitmap);

    var scl = 2;
    bw.scale(scl, scl);

    var div = $isotopeItem.find('div.barcodeOutput')[0];
    if (div)
      div.innerHTML = '';

    bw.push(text);
    bw.push(opts);

    try {
      bw.call(elt.sym);
      bw.bitmap().show($isotopeItem.find('canvas.barcodeImg')[0], rot);
    } catch (e) {
      var s = '';
      if (e.fileName)
        s += e.fileName + ' ';
      if (e.lineNumber)
        s += '[line ' + e.lineNumber + '] ';
      alert(s + (s ? ': ' : '') + e.message);
    }
  };
}(window.ui = window.ui || {}, jQuery));