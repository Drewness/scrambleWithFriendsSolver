// build the dictionary
all = JSON.parse('{'+all.replace(/([a-z])/g,"\"$1\":{")
	.replace(/([0-9])/g, function($1){
		var a = parseFloat($1), b = '';
		if(a > 0){
			for(var x=0;x<a;x++){
				b += '}';
			}
		}
		return '"0":1'+b+',';
	}).replace(/([A-Z])/g, function($1){
		var a = $1.charCodeAt()-55, b = '';
		for(var x=0;x<a;x++){
			b += '}';
		}
		return '"0":1'+b+',';
	})+'"0":1}}}}}}}}');

// set up the letter points var for global use
var lv = {a:1,b:4,c:4,d:2,e:1,f:4,g:3,h:3,i:1,j:10,k:5,l:2,m:4,n:2,o:1,p:4,q:10,r:1,s:1,t:1,u:2,v:5,w:4,x:8,y:3,z:10};

// solve the board
function solver(){
	
	// exit out if not all the tiles have been filled in
	if($('#tiles').val().length!=16){
		return false;
	}
	
	// set up some vars
	var t = {
			0:{c:'145'},
			1:{c:'02456'},
			2:{c:'13567'},
			3:{c:'267'},
			4:{c:'01589'},
			5:{c:'0124689a'},
			6:{c:'123579ab'},
			7:{c:'236ab'},
			8:{c:'459cd'},
			9:{c:'4568acde'},
			a:{c:'5679bdef'},
			b:{c:'67aef'},
			c:{c:'89d'},
			d:{c:'89ace'},
			e:{c:'9abdf'},
			f:{c:'abe'}
		}, wl = [], nd = [], htm = '', i = {}, ii = {}, k = {}, obj = {}, pre = {}, tsf = {};
	
	// build and check utility
	function buildAndCheck(x){
		for(i[x] = 0, ii[x] = t[k[x]]['c'].length; i[x] < ii[x]; i[x]++){
			k[x+1] = t[k[x]]['c'][i[x]];
			if(x === 0){
				obj[0] = all[t[k[0]]['l']];
			}
			if(x === 0 || tsf[x].indexOf(k[x+1]) === -1){
				if(obj[x][t[k[x+1]]['l']]){
					obj[x+1] = obj[x][t[k[x+1]]['l']];
					if(x > 0){
						pre[x+1] = pre[x] + t[k[x+1]]['l'];
						tsf[x+1] = tsf[x] + k[x+1];
					} else {
						pre[1] = t[k[0]]['l'] + t[k[1]]['l'],
						tsf[1] = k[0] + k[1];
					}
					if(obj[x+1]['0']){
						wl.push([tsf[x+1],pre[x+1]]);
					}
					if(x < 15){
						buildAndCheck(x+1);
					}
				}
			}
		}
	}
	
	// add letters, bonuses, and points to our tracker object
	$('.tile').each(function(){
		var tid = $(this).attr('id').substring(1);
		if($(this).find('.letter').text().toLowerCase() == 'qu'){
			t[tid]['l']=$(this).find('.letter').text().toLowerCase().replace('qu','q');
		} else {
			t[tid]['l']=$(this).find('.letter').text().toLowerCase();
		}
		if($(this).find('.bonus').text()=='DW' || $(this).find('.bonus').text()=='TW'){
			t[tid]['b']=$(this).find('.bonus').text();
		}
		if($(this).find('.bonus').text()=='DL'){
			t[tid]['p']=lv[t[tid]['l']]*2;
		} else if($(this).find('.bonus').text()=='TL'){
			t[tid]['p']=lv[t[tid]['l']]*3;
		} else {
			t[tid]['p']=lv[t[tid]['l']];
		}
	});
	
	// build and check each letter combination
	$.each(t,function(k0,v0){
		k[0] = k0;
		buildAndCheck(0);
	});
	
	// calculate the score for each word
	for(var x=0,xx=wl.length;x<xx;x++){
		var score=0,bonuses=[],wlb;
		for(y=0,yy=wl[x][0].length;y<yy;y++){
			score=score+t[wl[x][0][y]]['p'];
			if(t[wl[x][0][y]]['b']){
				bonuses.push(t[wl[x][0][y]]['b']);
			}
		}
		if(bonuses.length>0){
			for(y=0,yy=bonuses.length;y<yy;y++){
				if(bonuses[y] == 'DW'){
					score=score*2;
				} else if(bonuses[y] == 'TW'){
					score=score*3;
				}
			}
		}
		if(wl[x][0].length == 5){
			score=score+3;
		} else if(wl[x][0].length == 6){
			score=score+6;
		} else if(wl[x][0].length > 6){
			score=score+((wl[x][0].length-5)*5);
		}
		wl[x].push(score);
	}
	
	// sort words from highest to lowest score
	wl.sort(function(a,b){
		return b[2]-a[2];
	});
	
	// remove duplicates with lower scores
	for(x=0,xx=wl.length;x<xx;x++){
		var dup = false;
		for(y=0,yy=nd.length;y<yy;y++){
			if(wl[x][1] == nd[y][1]){
				dup = true;
			}
		}
		if(dup == false){
			nd.push(wl[x]);
		}
	}
	
	// build and display the results
	for(var x=0,xx=nd.length;x<xx;x++){
		if(wl[x][1].indexOf('q')>-1){
			var word = nd[x][1].replace('q','qu');
		} else {
			var word = nd[x][1];
		}
		htm+='<div class="word-score" data-tiles="t'+nd[x][0]+'"><div class="score">'+nd[x][2]+'</div><div class="word">'+word+'</div></div>';
	}
	$('.results').html(htm);
	$('.word-score:first').addClass('hilite').focus();
	$('#right .status').html('Formed <b>'+nd.length+'</b> words. Press shift or the right arrow key to highlight the next word.');
}

// create the connections between tiles
function connect(f,t){
	var d,fx,fy,tx,ty;
	switch(f){
		case '0':fy=0;fx=0;break;
		case '1':fy=0;fx=1;break;
		case '2':fy=0;fx=2;break;
		case '3':fy=0;fx=3;break;
		case '4':fy=1;fx=0;break;
		case '5':fy=1;fx=1;break;
		case '6':fy=1;fx=2;break;
		case '7':fy=1;fx=3;break;
		case '8':fy=2;fx=0;break;
		case '9':fy=2;fx=1;break;
		case 'a':fy=2;fx=2;break;
		case 'b':fy=2;fx=3;break;
		case 'c':fy=3;fx=0;break;
		case 'd':fy=3;fx=1;break;
		case 'e':fy=3;fx=2;break;
		case 'f':fy=3;fx=3;break;
	}
	switch(t){
		case '0':ty=0;tx=0;break;
		case '1':ty=0;tx=1;break;
		case '2':ty=0;tx=2;break;
		case '3':ty=0;tx=3;break;
		case '4':ty=1;tx=0;break;
		case '5':ty=1;tx=1;break;
		case '6':ty=1;tx=2;break;
		case '7':ty=1;tx=3;break;
		case '8':ty=2;tx=0;break;
		case '9':ty=2;tx=1;break;
		case 'a':ty=2;tx=2;break;
		case 'b':ty=2;tx=3;break;
		case 'c':ty=3;tx=0;break;
		case 'd':ty=3;tx=1;break;
		case 'e':ty=3;tx=2;break;
		case 'f':ty=3;tx=3;break;
	}
	if(tx>fx){
		if(ty<fy){d='top-right'}else if(ty>fy){d='bottom-right'}else{d='right'}
	} else if(tx<fx){
		if(ty<fy){d='top-left'}else if(ty>fy){d='bottom-left'}else{d='left'}
	} else{
		if(ty<fy){d='top'}else{d='bottom'}
	}
	$('#c'+f).addClass(d);
}

$(function(){
	
	// focus on the tiles input on page load
	$('#tiles').focus();
	
	// keep track of keystrokes and fill in the board
	$('#tiles').keyup(function(){
		var y=$(this).val().length;
		if(y<16){$('.tile').attr('class','tile ui-droppable');}
		for(var x=0;x<16;x++){
			if(y>x && isNaN($(this).val()[x])){
				if($(this).val()[x].toLowerCase() == 'q'){
					$('.tile').eq(x).find('.letter').html('Qu').siblings('.points').html('10');
				} else {
					$('.tile').eq(x).find('.letter').html($('#tiles').val()[x].toUpperCase()).siblings('.points').html(lv[$('#tiles').val()[x].toLowerCase()]);
				}
			} else if(y>x && isNaN($(this).val()[x])){
				$(this).val($(this).val().replace(/[^a-z]/gi,''));
			} else {
				$('.tile').eq(x).find('.letter').html('').siblings('.points').html('');
			}
		}
	});
	
	// give the bonuses drag and drop
	$('#bonuses div:not(#bx)').draggable({helper:'clone'});
	$('.tile').droppable({
		hoverClass:'ui-state-hover',
		drop:function(event,ui){
			$(this).find('.bonus').html(ui.draggable.html());
		}
	});
	
	// clear out the bonuses
	$('#bx').click(function(){
		$('.bonus').html('');
	});
	
	// solve the board on command
	$('#get-words').click(function(){
		solver();
	});
	$('form').submit(function(e){
		e.preventDefault();
		solver();
	});
	
	// keyboard shortcuts
	$('body').keydown(function(e){
		if($('.results .hilite').length){
			if((e.keyCode == 16 || e.keyCode == 39) && $('.results .hilite').next().length>0){
				$('.results .hilite').removeClass('hilite').next().addClass('hilite').focus();
			} else if(e.keyCode == 37 && $('.results .hilite').prev().length>0) {
				$('.results .hilite').removeClass('hilite').prev().addClass('hilite').focus();
			}
		}
	});
	
	// highlight and connect the appropriate tiles
	$(document).on('focus','.word-score',function(){
		var tiles = $(this).data('tiles').substring(1);
		$('.tile').attr('class','tile ui-droppable');
		for(x=0,xx=tiles.length;x<xx;x++){
			if(x==0){
				$('#c'+tiles[x]).addClass('first-hilite');
			} else {
				$('#c'+tiles[x]).addClass('hilite');
			}
			if(x<tiles.length-1){
				connect(tiles[x],tiles[x+1]);
			}
		}
	});
	
	// clicking a word should put it in focus
	$(document).on('click','.word-score',function(){
		$(this).siblings('.hilite').removeClass('hilite').end().addClass('hilite').focus();
	});
});
