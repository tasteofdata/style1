function drawPopo(fjson){

//  Ajax function	
//	$.getJSON(fjson, function(data) {
//	    var sys = arbor.ParticleSystem(1000, 400,1);
//	    sys.parameters({gravity:true});
//	    sys.renderer = Renderer("#popo");
//
//	    
//		var nodes=data;
//		//alert(data[1][0]['relation']);
//		var nodedict={}
//		var colors = ["red","green","blue","yellow","orange","Aqua","BlueViolet","Chartreuse","Navy","Magenta"];
//		$.each(nodes, function(){
//			var coloindex = parseInt(10*Math.random());
//			var oneNode = sys.addNode(this['title'],{'color':colors[coloindex],'shape':'dot','label':this['title'],link:this['link'],mass:2});
//			nodedict[this['enamech']] = oneNode;
//		});
//
//		//edage drawing code
////		$.each(edges, function(){	
////
////			if (this['relation']=='isFather'){
////				sys.addEdge(nodedict[this['source']], nodedict[this['target']], {'color':'#000079','label':this['relation']});
////			} else if (this['relation']=='isMother') {
////				sys.addEdge(nodedict[this['source']], nodedict[this['target']], {'color':'#006000','label':this['relation']});
////			};
////		});
//	    
//	});

    var sys = arbor.ParticleSystem(1000, 400,1);
    sys.parameters({gravity:true});
    sys.renderer = Renderer("#popo");

	    
		var nodes=[{"title": "新闻", "weight": "76", "link": "blank"}, {"title": "最新活动", "weight": "96", "link": "blank"}, {"title": "名医系统", "weight": "60", "link": "blank"}, {"title": "热门话题", "weight": "74", "link": "blank"}];
		var nodedict={}
		var colors = ["red","green","blue","yellow","orange","Aqua","BlueViolet","Chartreuse","Navy","Magenta"];
		$.each(nodes, function(){
			var coloindex = parseInt(10*Math.random());

			var oneNode = sys.addNode(this['title'],{'color':colors[coloindex],'shape':'dot','label':this['title'],'link':this['link'],'weight':this['weight'],mass:2});
			nodedict[this['enamech']] = oneNode;
		});

}

