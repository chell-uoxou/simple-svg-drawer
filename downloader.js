/**
 *
 * @module createDownloader
 * @desc セレクターにダウンロード機能を付加します。
 */
function createDownloader(){
    
    var doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
    var prefix = {
        xmlns: "http://www.w3.org/2000/xmlns/",
        xlink: "http://www.w3.org/1999/xlink",
        svg: "http://www.w3.org/2000/svg"
    }
    
    
    
    function exports(_selection) {
        var svg = _selection.node()
        
        var w = svg.clientWidth, h = svg.clientHeight
        
        
        var _emptySvg,_emptySvgDeclarationComputed
        var _copyChart
        
        
        
        function createEmptySVG() {
            _emptySvg = window.document.createElementNS(prefix.svg, 'svg');
            window.document.body.appendChild(_emptySvg);
            _emptySvgDeclarationComputed = getComputedStyle(_emptySvg);
            
        }
        
        function createCopySVG() {
            _copyChart = d3.select("body")
                .append("div")
                .html(svg.innerHTML)
                .node()            
            
        }

        function traverse(obj){
            var tree = [];
            tree.push(obj);
            visit(obj);
            function visit(node) {
                if (node && node.hasChildNodes()) {
                    var child = node.firstChild;
                    while (child) {
                        if (child.nodeType === 1 && child.nodeName != 'SCRIPT'){
                            tree.push(child);
                            visit(child);
                        }
                        child = child.nextSibling;
                    }
                }
            }
            return tree;
        }
        
        function explicitlySetStyle(element) {
            var cSSStyleDeclarationComputed = getComputedStyle(element)
            var attributes = Object.keys(element.attributes).map(function(i){ return element.attributes[i].name } )          
            var i, len
            var computedStyleStr = ""
            for (i=0, len=cSSStyleDeclarationComputed.length; i<len; i++) {
                var key=cSSStyleDeclarationComputed[i]             
                var value=cSSStyleDeclarationComputed.getPropertyValue(key)
                if(!attributes.some(function(k){ return k === key}) && value!==_emptySvgDeclarationComputed.getPropertyValue(key)) {
                    computedStyleStr+=key+":"+value+";"
                }            
            }
            element.setAttribute('style', computedStyleStr);
        }        

        function downloadSVG(source) {
            var filename = "chart.svg";
            var svg = d3.select(source).select("svg")
                .attr("xmlns", prefix.svg)
                .attr("version", "1.1")            
                .node()
            
            var blobObject = new Blob([doctype +  (new XMLSerializer()).serializeToString(svg)], { "type" : "text\/xml" })   
            
            if (navigator.appVersion.toString().indexOf('.NET') > 0){ 
                window.navigator.msSaveBlob(blobObject, filename)

            }else {
                var url = window.URL.createObjectURL(blobObject)                
                var a = d3.select("body").append("a")
                
                a.attr("class", "downloadLink")
                    .attr("download", "chart.svg")
                    .attr("href", url)
                    .text("test")
                    .style("display", "none")
                    
                    a.node().click()
    
                setTimeout(function() {
                  window.URL.revokeObjectURL(url)
                  a.remove()
                }, 10);            
            }
        }    


        function downloadPNG(source) {
            var filename = "chart.png";
            
            var svg = d3.select(source).select("svg")
                .attr("xmlns", prefix.svg)
                .attr("version", "1.1")
                .node()
                                    
            var data_uri =  "data:image/svg+xml;utf8," +   encodeURIComponent( (new XMLSerializer()).serializeToString(svg) )
                        
            var canvas = d3.select("body").append("canvas")
                .attr("id", "drawingArea")
                .attr("width", w)
                .attr("height", h)
                .style("display", "none")
            
            var context = canvas.node().getContext("2d")


            var download = function() {
            
                if (navigator.appVersion.toString().indexOf('.NET') > 0){

                    canvg(document.getElementById('drawingArea'), (new XMLSerializer()).serializeToString(svg))
    
                    var dataURI2Blob = function(dataURI, dataTYPE) {
                           var binary = atob(dataURI.split(',')[1]), array = [];
                           for(var i = 0; i < binary.length; i++) array.push(binary.charCodeAt(i));
                           return new Blob([new Uint8Array(array)], {type: dataTYPE});
                       }                   
                    
                    var data_uri = canvas.node().toDataURL("image/png")
                    var blobObject = dataURI2Blob(data_uri, "image/png")
                        
                    window.navigator.msSaveBlob(blobObject, filename)
    
                }else {
    
                    context.drawImage(img, 0, 0) 
                    var url = canvas.node().toDataURL("image/png")
                    var a = d3.select("body").append("a").attr("id", "downloadLink")
                    
                    a.attr("class", "downloadLink")
                        .attr("download", filename)
                        .attr("href", url)
                        .text("test")
                        .style("display", "none")
                        
                        a.node().click()
        
                    setTimeout(function() {
                      window.URL.revokeObjectURL(url)
                      canvas.remove()
                      a.remove()
                    }, 10);            
                }
                    
                
            }                
                
            var img = new Image();
            img.src = data_uri
            if (navigator.appVersion.toString().indexOf('.NET') > 0){ //IE hack
                d3.select(img).attr("onload", download)
            }else{
                img.addEventListener('load', download, false)                
            }
            
            
        }
        
        
        
        _selection.downloadSVG = function(){
            
            createEmptySVG()
            createCopySVG()
            
            var allElements = traverse(_copyChart)            
            var i = allElements.length;            
            while (i--){
                explicitlySetStyle(allElements[i]);
            }
            
            downloadSVG(_copyChart)
            
            d3.select(_copyChart).remove()
            d3.select(_emptySvg).remove()
            
        }
        
        _selection.downloadPNG = function(){
            
            createEmptySVG()
            createCopySVG()
            
            var allElements = traverse(_copyChart)            
            var i = allElements.length;            
            while (i--){
                explicitlySetStyle(allElements[i]);
            }
            
            downloadPNG(_copyChart)
            
            d3.select(_copyChart).remove()
            d3.select(_emptySvg).remove()
            
        }

        
    }
    
    

    return exports
    
}
