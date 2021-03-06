

// render of arbor.js network maps
(
		
function(){
  
  Renderer = function(canvas){
    var canvas = $(canvas).get(0)
    var ctx = canvas.getContext("2d")
    var gfx = arbor.Graphics(canvas)
    var particleSystem = null
  

    
    var that = {
      init:function(system){
        particleSystem = system
        particleSystem.screenSize(canvas.width, canvas.height) 
        particleSystem.screenPadding(40)

        that.initMouseHandling()
        
      },

      redraw:function(){
        if (!particleSystem) return

        gfx.clear() // convenience ƒ: clears the whole canvas rect


        // draw the nodes & save their bounds for edge drawing
        var nodeBoxes = {}
        particleSystem.eachNode(function(node, pt){
          // node: {mass:#, p:{x,y}, name:"", data:{}}
          // pt:   {x:#, y:#}  node position in screen coords

          // determine the box size and round off the coords if we'll be 
          // drawing a text label (awful alignment jitter otherwise...)
          var label = node.data.label||""
          var labelColor = node.data.lcolor||""
          if (labelColor==0){
        	  labelColor = "#000000"
          } 

         // var w = ctx.measureText(""+label).width + 10
          var w = parseInt(node.data.weight);
          if (w==null){
        	  w = 70
          }
           
          //alert(node.data.link)
          if (!(""+label).match(/^[ \t]*$/)){
            pt.x = Math.floor(pt.x)
            pt.y = Math.floor(pt.y)
          }else{
            label = null
          }
          
          // range control
          if (pt.x>=canvas.width-w){
          	pt.x = pt.x - w
          }
          
          if (pt.x<=w){
            pt.x = pt.x + w
          }

          if (pt.y>=canvas.height-w){
          	pt.y = pt.y - w
          }
          
          if (pt.y<=w){
            pt.y = pt.y + w
          }

          // draw a rectangle centered at pt
          if (node.data.color) ctx.fillStyle = node.data.color
          else ctx.fillStyle = "rgba(0,0,0,.2)"
          if (node.data.color=='none') ctx.fillStyle = "white"
          ctx.strokeStyle = "black"
          ctx.lineWidth = 1
          if (node.data.shape=='dot'){
            gfx.oval(pt.x-w/2, pt.y-w/2, w,w, {fill:ctx.fillStyle})
            nodeBoxes[node.name] = [pt.x-w/2, pt.y-w/2, w,w]
            
            gfx.oval(pt.x-w/2, pt.y-w/2, w,w, {stroke:ctx.strokeStyle})
            nodeBoxes[node.name] = [pt.x-w/2, pt.y-w/2, w,w]
          }else{
            gfx.rect(pt.x-w/2, pt.y-10, w,20, 4, {fill:ctx.fillStyle})
            nodeBoxes[node.name] = [pt.x-w/2, pt.y-11, w, 22]
            
            //gfx.rect(pt.x-w/2, pt.y-10, w,20, 4, {stroke:ctx.strokeStyle})
            //nodeBoxes[node.name] = [pt.x-w/2, pt.y-11, w, 22]
          } 
          
          var radius = w*0.2
          
          var radgrad = ctx.createRadialGradient(
        		  pt.x-radius/10,pt.y-radius/10,0,
        		  pt.x-radius/10,pt.y-radius/10,radius+30);
        	radgrad.addColorStop(0,'white');
        	radgrad.addColorStop(0.5,'white');
        	radgrad.addColorStop(1,'rgba(255,255,255,0.3)');
        	ctx.globalAlpha = 0.6;
        	ctx.fillStyle = radgrad;
        	 
        	ctx.fill();
          
          
          
          // draw the text
          if (label){
            ctx.font = "10px Helvetica"
            ctx.textAlign = "center"
            ctx.fillStyle = labelColor
            if (node.data.color=='none') ctx.fillStyle = '#333333'
            ctx.fillText(label||"", pt.x, pt.y+4)
            ctx.fillText(label||"", pt.x, pt.y+4)
          }
          
          
          
          
        })    			


        // draw the edges
        particleSystem.eachEdge(function(edge, pt1, pt2){
          // edge: {source:Node, target:Node, length:#, data:{}}
          // pt1:  {x:#, y:#}  source position in screen coords
          // pt2:  {x:#, y:#}  target position in screen coords

          var weight = edge.data.weight
          var color = edge.data.color

          if (!color || (""+color).match(/^[ \t]*$/)) color = null

          // find the start point
          var tail = intersect_line_box(pt1, pt2, nodeBoxes[edge.source.name])
          var head = intersect_line_box(tail, pt2, nodeBoxes[edge.target.name])
          
          // draw the text
//          var label = edge.data.label||""
//          var w = ctx.measureText(""+label).width + 10
//          var x = (pt1.x + pt2.x)/2
//    	  var y = (pt1.y + pt2.y)/2
//          if (!(""+label).match(/^[ \t]*$/)){
//            x = Math.floor(x)
//            y = Math.floor(y)
//          }else{
//            label = null
//          }
//          if (label){
//        	  
//              ctx.font = "10px Helvetica"
//              ctx.textAlign = "center"
//              ctx.fillStyle = "black"
//              if (edge.data.color=='none') ctx.fillStyle = '#333333'
//              ctx.fillText(label||"", x, y+4)
//              ctx.fillText(label||"", x, y+4)
//          }
          
       // draw the edge line
          	ctx.save() 
//			ctx.beginPath()
//			ctx.lineWidth = (!isNaN(weight)) ? parseFloat(weight) : 1
			ctx.strokeStyle = (color) ? color : "#cccccc"
			ctx.fillStyle = (color) ? color : "#cccccc"
//			//ctx.fillStyle = null
//			
//			ctx.moveTo(tail.x, tail.y)
//			ctx.lineTo(head.x, head.y)
//			ctx.closePath();
			
			
			
			//draw arrow
			
			drawLineArrow(tail.x, tail.y, head.x, head.y,ctx)
			
			ctx.stroke()
			ctx.restore()


          // draw an arrowhead if this is a -> style edge
          if (edge.data.directed){
            ctx.save()
              // move to the head position of the edge we just drew
              var wt = !isNaN(weight) ? parseFloat(weight) : 1
              var arrowLength = 6 + wt
              var arrowWidth = 2 + wt
              ctx.fillStyle = (color) ? color : "#cccccc"
              ctx.translate(head.x, head.y);
              ctx.rotate(Math.atan2(head.y - tail.y, head.x - tail.x));

              // delete some of the edge that's already there (so the point isn't hidden)
              ctx.clearRect(-arrowLength/2,-wt/2, arrowLength/2,wt)

              // draw the chevron
              ctx.beginPath();
              ctx.moveTo(-arrowLength, arrowWidth);
              ctx.lineTo(0, 0);
              ctx.lineTo(-arrowLength, -arrowWidth);
              ctx.lineTo(-arrowLength * 0.8, -0);
              ctx.closePath();
              
              ctx.fill();
            ctx.restore()

          }
        })



      },

      initMouseHandling:function(){
          // agrega el manejador para los metodos del mouse
          selected = null;
          nearest = null;
          var dragged = null;
          var oldmass = 1

          //  inicializa un manejador del objeto para que escuche los eventos del clic
          var handler = {
            clicked:function(e){
            //funcion clic
              var pos = $(canvas).offset();
              _mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)
              selected = nearest = dragged = particleSystem.nearest(_mouseP);

              if (dragged.node !== null) dragged.node.fixed = true

              $(canvas).bind('mousemove', handler.dragged)//le indica que puede arrastrarlo
              $(window).bind('mouseup', handler.dropped)//le indica que puede soltarlo, evento draganddrop
             $(canvas).bind('mouseup', handler.dobleclicked)//caso de que se haga dobleclic
              
              $(canvas).unbind('dblclick', handler.tripleclicked)//desactiva el dobleclic
              return false
            },
            dragged:function(e){
            //funcion arrastrar del mouse
              var old_nearest = nearest && nearest.node._id
              var pos = $(canvas).offset();
              var s = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)

              if (!nearest) return
              if (dragged !== null && dragged.node !== null){
                var p = particleSystem.fromScreen(s)
                dragged.node.p = p
              }
  			$(canvas).unbind('mouseup', handler.dobleclicked)
              
              return false
            },
            dropped:function(e){
            //funcion soltar del mouse
              if (dragged===null || dragged.node===undefined) return
              if (dragged.node !== null) dragged.node.fixed = false
              dragged.node.tempMass = 50
              dragged = null
              selected = null
              $(canvas).unbind('mousemove', handler.dragged)
              $(window).unbind('mouseup', handler.dropped)
              $(canvas).unbind('mouseup', handler.dobleclicked)
              $(canvas).unbind('dblclick', handler.tripleclicked) 
              _mouseP = null
              clic2veces='A';
              return false
            },
            dobleclicked:function(e){
            //caso de que se haga dobleclic, maneja el evento clic para mostrar los nodos hijos
           	if (dragged===null || dragged.node===undefined) return
            	if (dragged.node !== null){
            	
             		dragged.node.fixed = false
             		
             		var id=dragged.node.data.link;           		
             		
   				 $.ajax({
      			data: '',
      			type: "GET",
      			dataType: "json",
      			url: dragged.node.data.link,

      			success: function(dataObject){
      				 $.getJSON(dragged.node.data.link, function(data) {

      				});

      				//particleSystem.addNode('a',{'color':'black','shape':'dot','label':'a',link:"/varityajax/json/180995",mass:2})
         			restults(dataObject);
         			document.getElementById('loading').innerHTML="";
       			}
      	        
     			});  				
    				
  				var restults = function(data){
       			/*$("div.descripcion").html("").show();
       			
         			$("div.info").append("Arbol: "+data.arbol);
         			$("div.info").append("Nodo: "+data.nodo);
         			$("div.info").append("Padre: "+data.padre);
         			$("div.info").append("Nombre: "+data.nombre);
         			$("div.info").append("Tipo: "+data.tipo);
         			$("div.descripcion").append("Impresi贸n: "+data.lista);*/
         			
         			//document.getElementById('descripcionnodos').innerHTML=''+ data.descdep;
         			
         			eval(data.nodes);
         			
    				};//var restults
            		
            		
            		
            		
            		}//nodo diferente de null
            		
            		//dragged = null
              	selected = null
              	$(canvas).unbind('mousemove', handler.dragged)
              	$(window).unbind('mouseup', handler.dropped)
              	$(canvas).unbind('mouseup', handler.dobleclicked)
              	$(canvas).bind('dblclick', handler.tripleclicked) 
              	_mouseP = null
              	
            		return false
            },//dobleclicked
//             tripleclicked:function(e){
//             //funcion para dobleclic que dibuja las flechas de dependencias a los nodos
//             var id=dragged.node.name;
//           
//            		if (clic2veces==id)
//            		{
//            		
//            		clic2veces='A';
//            		}else{
//            		
//            		 $.ajax({
//      			data: "pid="+id,
//      			type: "GET",
//      			dataType: "json",
//      			url: "dependencias.php",
//      			success: function(data){
//         			restults(data);
//       			}
//     				});  				
//    				
//  				var restults = function(data){
//         			eval(data.dependencias);
//    				};
//            		clic2veces=id;
//            		}
//             
//             
//             
//             
//             dragged = null
//              	selected = null
//              	$(canvas).unbind('mousemove', handler.dragged)
//              	$(window).unbind('mouseup', handler.dropped)
//              	 
//              	$(canvas).unbind('dblclick', handler.tripleclicked) 
//              	_mouseP = null
//              	
//            		return false
//             }
            
          }
          $(canvas).mousedown(handler.clicked);
         

        }   
      

    }

    // helpers for figuring out where to draw arrows (thanks springy.js)
    var intersect_line_line = function(p1, p2, p3, p4)
    {
      var denom = ((p4.y - p3.y)*(p2.x - p1.x) - (p4.x - p3.x)*(p2.y - p1.y));
      if (denom === 0) return false // lines are parallel
      var ua = ((p4.x - p3.x)*(p1.y - p3.y) - (p4.y - p3.y)*(p1.x - p3.x)) / denom;
      var ub = ((p2.x - p1.x)*(p1.y - p3.y) - (p2.y - p1.y)*(p1.x - p3.x)) / denom;

      if (ua < 0 || ua > 1 || ub < 0 || ub > 1)  return false
      return arbor.Point(p1.x + ua * (p2.x - p1.x), p1.y + ua * (p2.y - p1.y));
    }

    var intersect_line_box = function(p1, p2, boxTuple)
    {
      var p3 = {x:boxTuple[0], y:boxTuple[1]},
          w = boxTuple[2],
          h = boxTuple[3]

      var tl = {x: p3.x, y: p3.y};
      var tr = {x: p3.x + w, y: p3.y};
      var bl = {x: p3.x, y: p3.y + h};
      var br = {x: p3.x + w, y: p3.y + h};

      return intersect_line_line(p1, p2, tl, tr) ||
            intersect_line_line(p1, p2, tr, br) ||
            intersect_line_line(p1, p2, br, bl) ||
            intersect_line_line(p1, p2, bl, tl) ||
            false
    }

    return that
  }    
  
})()