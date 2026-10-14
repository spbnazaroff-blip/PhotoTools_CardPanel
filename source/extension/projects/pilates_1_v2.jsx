// PT_SCHEMA={"category":"Пилатес","description":"FW PILATES • светлый премиальный постер. Полноформатный портрет, мягкая левая колонка, деликатное затемнение, только нативные слои Photoshop.","fields":[{"id":"first","label":"Имя","type":"text","default":"Екатерина"},{"id":"last","label":"Фамилия","type":"text","default":"Назарова"},{"id":"studio","label":"Название сети / студии","type":"text","default":"FW PILATES"},{"id":"brandNote","label":"Подпись студии","type":"text","default":"СЕТЬ СТУДИЙ КЛАССИЧЕСКОГО ПИЛАТЕСА"},{"id":"location","label":"Город","type":"text","default":"САНКТ-ПЕТЕРБУРГ"},{"id":"role","label":"Должность","type":"text","default":"СЕРТИФИЦИРОВАННЫЙ ПРЕПОДАВАТЕЛЬ ПИЛАТЕСА"},{"id":"motto","label":"Посыл (до 5 строк)","type":"textarea","default":"ПИЛАТЕС БОЛЬШЕ,\nЧЕМ ТРЕНИРОВКА —\nЭТО ЗАБОТА\nО СЕБЕ"},{"id":"section","label":"Заголовок квалификаций","type":"text","default":"МЕЖДУНАРОДНЫЕ ШКОЛЫ ПИЛАТЕСА:"},{"id":"credentials","label":"Квалификации (5 строк, по одному пункту на строку)","type":"textarea","array":true,"default":"Authentic Pilates Inelia Garcia (Бразилия)\nThe Pilates Standard (Швеция)\nТренер BLACKROLL, миофасциальные методики (Германия)\nТренер по функциональному тренингу, стретчингу\nУчастник международных и российских конвенций и воркшопов"},{"id":"footer","label":"Нижняя подпись","type":"text","default":"ГАРМОНИЯ ДВИЖЕНИЯ   •   СИЛА   •   КОНТРОЛЬ"},{"id":"fontTitle","label":"Шрифт имени (нужен установленный в Windows шрифт)","type":"select","default":"Оригинальный","options":["Оригинальный","Georgia-Bold","Arial-BoldMT","Montserrat-Bold","TimesNewRomanPS-BoldMT","BodoniMT-Bold"]},{"id":"photoShift","label":"Сдвиг фотографии вправо (%) — 0…22","type":"number","default":8},{"id":"shadeStrength","label":"Сила затемнения (%) — 0…100","type":"number","default":58}]}
#target photoshop
// PhotoTools Studio / PILATES 1 / CEP compatible / Photoshop ExtendScript.
// Only the currently open photo is raster. Every overlay is a Photoshop native
// gradient fill layer, shape layer, or editable Type layer. No auxiliary images.
(function () {
    var priorUnits=app.preferences.rulerUnits;
    var priorDialogs=app.displayDialogs;
    var src=null,doc=null,finished=false,step='Подготовка';
    var C=$.global.PT_CARD_CONF||{};
    var DW=1024,DH=1536,W=0,H=0,SX=1,SY=1,S=1;
    var GOLD='#E1BC90',LIGHT='#F9F7F3',MUTED='#DCD7CF',DARK='#10100E';
    var countType=0,countShape=0;
    function trim(t){return String(t===undefined||t===null?'':t).replace(/^\s+|\s+$/g,'');}
    function str(k,def){var v=trim(C[k]);return v?v:def;}
    function nval(k,def,lo,hi){var n=Number(C[k]);if(!isFinite(n))n=def;return Math.min(hi,Math.max(lo,n));}
    function arr(k,defaults){var v=C[k];if(v instanceof Array)return v; if(typeof v==='string')return v.split(/\r?\n/);return defaults;}
    function sid(a){return stringIDToTypeID(a);}
    function px(v){return UnitValue(v,'px');}
    function color(h){var c=new SolidColor();c.rgb.hexValue=h.replace('#','');return c;}
    function rgbDesc(h){var z=h.replace('#',''),d=new ActionDescriptor();d.putDouble(sid('red'),parseInt(z.substring(0,2),16));d.putDouble(sid('green'),parseInt(z.substring(2,4),16));d.putDouble(sid('blue'),parseInt(z.substring(4,6),16));return d;}
    function group(name){var g=doc.layerSets.add();g.name=name;return g;}
    function into(l,g){l.move(g,ElementPlacement.INSIDE);return l;}
    function layerBounds(l){var b=l.bounds;return [b[0].as('px'),b[1].as('px'),b[2].as('px'),b[3].as('px')];}
    function shape(kind,name,x,y,w,h,fill,stroke,sw,g,op,rotation){
        step='Векторная фигура: '+name;
        var mk=new ActionDescriptor(),r=new ActionReference();r.putClass(sid('contentLayer'));mk.putReference(sid('null'),r);
        var layer=new ActionDescriptor(),col=new ActionDescriptor();
        col.putObject(sid('color'),sid('RGBColor'),rgbDesc(fill||stroke||GOLD));
        layer.putObject(sid('type'),sid('solidColorLayer'),col);
        var geo=new ActionDescriptor();geo.putInteger(sid('unitValueQuadVersion'),1);
        geo.putUnitDouble(sid('top'),sid('pixelsUnit'),y*SY);
        geo.putUnitDouble(sid('left'),sid('pixelsUnit'),x*SX);
        geo.putUnitDouble(sid('bottom'),sid('pixelsUnit'),(y+h)*SY);
        geo.putUnitDouble(sid('right'),sid('pixelsUnit'),(x+w)*SX);
        layer.putObject(sid('shape'),sid(kind),geo);
        var st=new ActionDescriptor();st.putBoolean(sid('fillEnabled'),fill!==null);st.putBoolean(sid('strokeEnabled'),stroke!==null);
        st.putInteger(sid('strokeStyleVersion'),2);
        if(stroke!==null){st.putUnitDouble(sid('strokeStyleLineWidth'),sid('pixelsUnit'),Math.max(1,(sw||1)*S));
            var sc=new ActionDescriptor();sc.putObject(sid('color'),sid('RGBColor'),rgbDesc(stroke));
            st.putObject(sid('strokeStyleContent'),sid('solidColorLayer'),sc);}
        layer.putObject(sid('strokeStyle'),sid('strokeStyle'),st);
        mk.putObject(sid('using'),sid('contentLayer'),layer);executeAction(sid('make'),mk,DialogModes.NO);
        var l=doc.activeLayer;l.name=name;
        if(rotation){try{l.rotate(rotation,AnchorPosition.MIDDLECENTER);}catch(re){}}
        if(op!==undefined&&op!==null)l.opacity=op;
        into(l,g);countShape++;return l;
    }
    function rect(name,x,y,w,h,g,hex,opacity,deg){return shape('rectangle',name,x,y,w,h,hex||GOLD,null,0,g,opacity,deg||0);}
    function oval(name,x,y,w,h,g,fill,stroke,width,opacity){return shape('ellipse',name,x,y,w,h,fill,stroke,width,g,opacity,0);}
    function line(name,x,y,w,h,g,hex,opacity,deg){return rect(name,x,y,w,h,g,hex,opacity,deg);}
    function circle(name,x,y,d,g,width,opacity){return oval(name,x,y,d,d,g,null,GOLD,width||1.5,opacity);}
    // Native gradient fill; transparency stops, never a bitmap or external overlay.
    function grad(name,angle,op0,op1,opacity){
        step='Нативный градиент: '+name;
        var K=sid,make=new ActionDescriptor(),ref=new ActionReference();ref.putClass(K('contentLayer'));make.putReference(K('null'),ref);
        var layer=new ActionDescriptor(),style=new ActionDescriptor(),gradient=new ActionDescriptor();
        style.putUnitDouble(K('angle'),K('angleUnit'),angle);
        style.putEnumerated(K('type'),K('gradientType'),K('linear'));
        style.putUnitDouble(K('scale'),K('percentUnit'),100);style.putBoolean(K('dither'),true);
        gradient.putString(K('name'),'PhotoTools Pilates gradient');gradient.putEnumerated(K('gradientForm'),K('gradientForm'),K('customStops'));
        gradient.putDouble(K('interfaceIconFrameDimmed'),4096);
        var stops=new ActionList(),ops=new ActionList();
        for(var i=0;i<2;i++){
            var cs=new ActionDescriptor();cs.putObject(K('color'),K('RGBColor'),rgbDesc(DARK));
            cs.putEnumerated(K('type'),K('colorStopType'),K('userStop'));
            cs.putInteger(K('location'),i?4096:0);cs.putInteger(K('midpoint'),50);stops.putObject(K('colorStop'),cs);
            var os=new ActionDescriptor();os.putUnitDouble(K('opacity'),K('percentUnit'),i?op1:op0);
            os.putInteger(K('location'),i?4096:0);os.putInteger(K('midpoint'),50);ops.putObject(K('transferSpec'),os);
        }
        gradient.putList(K('colors'),stops);gradient.putList(K('transparency'),ops);
        style.putObject(K('gradient'),K('gradientClassEvent'),gradient);
        layer.putObject(K('type'),K('gradientLayer'),style);make.putObject(K('using'),K('contentLayer'),layer);
        executeAction(K('make'),make,DialogModes.NO);
        var l=doc.activeLayer;l.name=name;l.opacity=opacity;return l;
    }
    function setFont(t,names){for(var i=0;i<names.length;i++){try{t.font=names[i];return;}catch(e){}}}
    function type(name,content,x,y,size,fonts,hex,g,maxW,tracking){
        step='Текст: '+name;content=String(content||'');if(!trim(content))return null;
        x*=SX;y*=SY;size*=S;maxW=(maxW||950)*SX;
        var l=doc.artLayers.add();
        try{
            l.kind=LayerKind.TEXT;l.name=name;
            var t=l.textItem;t.kind=TextType.POINTTEXT;t.contents=content;t.color=color(hex||LIGHT);
            setFont(t,fonts||['ArialMT']);try{t.antiAliasMethod=AntiAlias.SMOOTH;}catch(aa){}
            if(tracking!==undefined)try{t.tracking=tracking;}catch(tr){}
            var dpi=doc.resolution||72;
            function scale(pxSize){t.size=UnitValue(pxSize*72/dpi,'pt');}
            scale(size);t.position=[px(x),px(y+size*1.1)];
            var b=layerBounds(l),w=b[2]-b[0],iter=0;
            while(w>maxW&&iter++<26){size=size*Math.min(0.94,0.97*maxW/w);scale(size);b=layerBounds(l);w=b[2]-b[0];}
            if(w>maxW+2)throw new Error('Не вмещается текстовый блок «'+name+'».');
            l.translate(px(x-b[0]),px(y-b[1]));
            into(l,g);countType++;return l;
        }catch(e){try{l.remove();}catch(ignore){}throw e;}
    }
    var FONT_LIGHT=['ArialMT','Arial-Regular','MyriadPro-Regular'];
    var FONT_BOLD=['Arial-BoldMT','Montserrat-Bold','ArialMT'];
    var FONT_SERIF=['Georgia','TimesNewRomanPSMT','ArialMT'];
    function titleFont(){var f=str('fontTitle','Оригинальный');return f==='Оригинальный'?FONT_BOLD:[f].concat(FONT_BOLD);}
    function normal(name,txt,x,y,sz,hex,g,width,track){return type(name,txt,x,y,sz,FONT_LIGHT,hex,g,width,track);}
    function heavy(name,txt,x,y,sz,hex,g,width,track){return type(name,txt,x,y,sz,FONT_BOLD,hex,g,width,track);}
    function title(name,txt,x,y,sz,hex,g,width,track){return type(name,txt,x,y,sz,titleFont(),hex,g,width,track);}
    function serif(name,txt,x,y,sz,hex,g,width,track){return type(name,txt,x,y,sz,FONT_SERIF,hex,g,width,track);}
    function parts(s,maxLen,maxRows){
        var words=trim(s).split(/\s+/),rows=[''],ix=0;
        for(var i=0;i<words.length;i++){
            if(ix<maxRows-1&&rows[ix]&&rows[ix].length+words[i].length+1>maxLen){ix++;rows[ix]='';}
            rows[ix]+=(rows[ix]?' ':'')+words[i];
        }
        return rows;
    }
    function sourcePhoto(l){if(!l||l.typename!=='ArtLayer')return false;
        try{return l.isBackgroundLayer||l.kind===LayerKind.NORMAL||l.kind===LayerKind.SMARTOBJECT;}catch(e){return false;}}
    function copySource(){
        step='Подготовка исходного фото';src=app.activeDocument;
        if(!sourcePhoto(src.activeLayer))throw new Error('Выбери фотографию или слой с фото, а не текст / фигуру.');
        // Intentionally require a photo-only source to avoid destroying any existing design.
        // Existing layered PSD: use a copy of one chosen photo layer; other source layers
        // remain intact in the ORIGINAL document.
        doc=src.duplicate('PhotoTools - Пилатес 1 v2',false);app.activeDocument=doc;
        if(doc.layers.length>1){
            step='Изоляция выбранной фотографии';var keep=doc.activeLayer;
            try{keep.move(doc,ElementPlacement.PLACEATBEGINNING);}catch(e){keep=keep.duplicate(doc,ElementPlacement.PLACEATBEGINNING);}
            keep.name='__KEEP_SOURCE_PHOTO__';
            while(doc.layers.length>1){var z=doc.layers[doc.layers.length-1];
                try{if(z.typename==='ArtLayer'&&z.isBackgroundLayer)z.isBackgroundLayer=false;}catch(ignore){}
                z.remove();}
        }
        if(doc.mode!==DocumentMode.RGB)doc.changeMode(ChangeMode.RGB);
        if(doc.bitsPerChannel!==BitsPerChannelType.EIGHT)doc.bitsPerChannel=BitsPerChannelType.EIGHT;
        W=doc.width.as('px');H=doc.height.as('px');if(W<500||H<700)throw new Error('Исходное фото слишком мало.');
        SX=W/DW;SY=H/DH;S=Math.min(SX,SY);
        var photo=doc.activeLayer;
        try{if(photo.isBackgroundLayer)photo.isBackgroundLayer=false;}catch(ignoreBg){}
        // Source photo remains an independent layer, possibly a Smart Object.
        if(photo.kind!==LayerKind.SMARTOBJECT){try{doc.activeLayer=photo;executeAction(sid('newPlacedLayer'),new ActionDescriptor(),DialogModes.NO);photo=doc.activeLayer;}catch(ignoreSmart){}}
        photo.name='ИЗОБРАЖЕНИЕ / исходное фото — менять положение здесь';
        var g=group('00 ФОТО — исходное изображение (единственный растр)');
        into(photo,g);
        var move=nval('photoShift',12,0,22);
        if(move>0)photo.translate(px(W*move/100),px(0));
        var base=rect('ПОДЛОЖКА / графит за сдвинутой фотографией',0,0,DW,DH,g,DARK,100);
        base.move(photo,ElementPlacement.PLACEAFTER);
    }
    function drawLogo(g){
        // Stylized FW Pilates monogram, drawn with native editable shapes.
        // It approximates the brand mark; for strict brand compliance adjust the vectors.
        oval('ЗНАК / контур петли',112,51,71,76,g,null,GOLD,3.5,96);
        line('ЗНАК / левая ножка',105,106,5,65,g,GOLD,100,18);
        line('ЗНАК / правая ножка',126,99,5,71,g,GOLD,100,18);
        oval('ЗНАК / точка',85,110,6,6,g,GOLD,null,0,100);
        line('ШТРИХ / под знаком',88,182,57,2,g,GOLD,100);
        normal('ЛОГОТИП / наименование студии',str('studio','FW PILATES').toUpperCase(),209,86,31,LIGHT,g,620,120);
        normal('ЛОГОТИП / описание',str('brandNote','СЕТЬ СТУДИЙ КЛАССИЧЕСКОГО ПИЛАТЕСА').toUpperCase(),209,132,12,LIGHT,g,700,95);
        normal('ГОРОД',str('location','САНКТ-ПЕТЕРБУРГ').toUpperCase(),87,201,14,MUTED,g,530,205);
    }
    function drawCredentials(g,ico){
        var defaultItems=[
            'Authentic Pilates Inelia Garcia (Бразилия)',
            'The Pilates Standard (Швеция)',
            'Тренер BLACKROLL, миофасциальные методики (Германия)',
            'Тренер по функциональному тренингу, стретчингу',
            'Участник международных и российских конвенций и воркшопов'
        ];
        var a=arr('credentials',defaultItems);
        var n=Math.min(5,a.length),ys=[914,1016,1118,1222,1326];
        for(var i=0;i<n;i++){
            var v=trim(a[i]);if(!v)continue;
            var y=ys[i];
            circle('0'+(i+1)+' / обводка',82,y-2,54,ico,1.7,98);
            if(i===0){
                circle('Глобус / внутреннее кольцо',94,y+10,30,ico,1,90);
                line('Глобус / экватор',98,y+25,24,1.5,ico,GOLD,95);
                line('Глобус / меридиан',108,y+12,1.5,27,ico,GOLD,95);
            }else if(i===1){
                line('Диплом / верх',102,y+10,17,1.8,ico,GOLD);line('Диплом / бок',101,y+10,2,28,ico,GOLD);
                line('Диплом / низ',102,y+37,17,1.8,ico,GOLD);line('Диплом / право',118,y+10,2,28,ico,GOLD);
                line('Диплом / строка',106,y+21,11,1.5,ico,GOLD);
            }else if(i===2){
                oval('Ролл / внешний',97,y+16,24,20,ico,null,GOLD,1.6,95);
                circle('Ролл / центр',105,y+21,10,ico,1.1,95);
            }else if(i===3){
                line('Тренинг / гриф',96,y+26,30,2,ico,GOLD);
                line('Тренинг / диск левый',100,y+17,3,20,ico,GOLD);
                line('Тренинг / диск правый',120,y+17,3,20,ico,GOLD);
                line('Тренинг / упор левый',94,y+21,2,13,ico,GOLD);
                line('Тренинг / упор правый',126,y+21,2,13,ico,GOLD);
            }else{
                circle('Воркшоп / ядро',106,y+20,9,ico,1.5,95);
                line('Воркшоп / луч 1',110,y+12,2,8,ico,GOLD);
                line('Воркшоп / луч 2',110,y+29,2,8,ico,GOLD);
                line('Воркшоп / луч 3',98,y+24,8,2,ico,GOLD);
                line('Воркшоп / луч 4',117,y+24,8,2,ico,GOLD);
            }
            var rows=parts(v,30,3);
            for(var k=0;k<rows.length;k++)if(rows[k])normal('КВАЛИФИКАЦИЯ '+(i+1)+' / строка '+(k+1),rows[k],164,y+4+k*24,18,LIGHT,g,360,10);
        }
    }
    function compose(){
        var strength=nval('shadeStrength',58,0,100);
        var shading=group('01 ЗАТЕМНЕНИЕ — мягкие нативные градиенты');
        into(grad('ЛЕВЫЙ ГРАДИЕНТ — основа читаемости',0,100,0,Math.round(strength*0.72)),shading);
        into(grad('ЛЕВЫЙ ГРАДИЕНТ 2 — лёгкий мягкий слой',0,72,0,Math.round(strength*0.35)),shading);
        into(grad('НИЖНИЙ ГРАДИЕНТ — мягкое основание',90,62,0,Math.max(18,Math.round(strength*0.34))),shading);
        into(grad('ВЕРХНИЙ ГРАДИЕНТ — деликатный',90,28,0,Math.max(8,Math.round(strength*0.16))),shading);

        var decor=group('02 ДЕКОР — рамки / дуга / разделители');
        line('РАМКА / верх лево',70,60,258,2,decor,GOLD,85);
        line('РАМКА / угол лево',70,60,2,86,decor,GOLD,85);
        line('РАМКА / верх право',654,60,300,2,decor,GOLD,72);
        line('РАМКА / угол право',952,60,2,86,decor,GOLD,72);
        oval('ДУГА / большая тонкая',664,-144,840,1380,decor,null,GOLD,1.5,33);
        line('АКЦЕНТ / посыл',88,470,54,2,decor,GOLD,92);
        line('РАЗДЕЛИТЕЛЬ / под должностью',84,822,382,2,decor,GOLD,78);
        line('ПОДВАЛ / верхний разделитель',84,1402,846,1.5,decor,GOLD,76);

        var header=group('03 ШАПКА / логотип и город');
        drawLogo(header);

        var slogan=group('04 ПОСЫЛ — редактируемые строки');
        var motto=arr('motto',['ПИЛАТЕС БОЛЬШЕ,','ЧЕМ ТРЕНИРОВКА —','ЭТО ЗАБОТА','О СЕБЕ']);
        for(var i=0;i<Math.min(5,motto.length);i++) if(trim(motto[i])){
            serif('ПОСЫЛ / '+(i+1),trim(motto[i]).toUpperCase(),88,298+i*31,18,GOLD,slogan,315,185);
        }

        var names=group('05 ИМЯ / статус');
        normal('ИМЯ',str('first','Екатерина').toUpperCase(),80,545,62,LIGHT,names,420,12);
        title('ФАМИЛИЯ',str('last','Назарова').toUpperCase(),78,618,86,GOLD,names,495,-8);
        var role=parts(str('role','СЕРТИФИЦИРОВАННЫЙ ПРЕПОДАВАТЕЛЬ ПИЛАТЕСА').toUpperCase(),26,2);
        for(var p=0;p<role.length;p++) normal('ДОЛЖНОСТЬ / '+(p+1),role[p],84,736+p*30,19,LIGHT,names,430,115);

        var info=group('06 КВАЛИФИКАЦИИ / текст');
        normal('РАЗДЕЛ / название',str('section','МЕЖДУНАРОДНЫЕ ШКОЛЫ ПИЛАТЕСА:').toUpperCase(),84,856,16,GOLD,info,430,90);
        var iconGroup=group('07 ИКОНКИ / только векторные фигуры');
        drawCredentials(info,iconGroup);

        var foot=group('08 НИЖНЯЯ ПОДПИСЬ');
        normal('ПОДПИСЬ / гармония движения',str('footer','ГАРМОНИЯ ДВИЖЕНИЯ   •   СИЛА   •   КОНТРОЛЬ').toUpperCase(),84,1448,17,GOLD,foot,860,160);
    }
    function countChildren(g){var n=0;for(var i=0;i<g.layers.length;i++)n++;return n;}
    function safeName(s){return s.replace(/\.[^.]*$/,'').replace(/[\\\/:*?"<>|]/g,'_').substr(0,55);}
    try{
        if(!app.documents.length)throw new Error('Открой фотографию в Photoshop.');
        app.displayDialogs=DialogModes.NO;app.preferences.rulerUnits=Units.PIXELS;
        copySource();compose();step='Сохранение многослойного PSD';
        var folder=new Folder(Folder.userData.fsName+'/PhotoTools/StudioSuite/OUTPUT');
        if(!folder.exists&&!folder.create())throw new Error('Не могу создать каталог OUTPUT.');
        var name=safeName(src.name)+'_PILATES_1_V2',f=new File(folder.fsName+'/'+name+'.psd'),k=2;
        while(f.exists){f=new File(folder.fsName+'/'+name+'_'+k+'.psd');k++;if(k>1000)throw new Error('Слишком много файлов с одинаковым именем.');}
        var save=new PhotoshopSaveOptions();save.layers=true;save.embedColorProfile=true;
        doc.saveAs(f,save,false,Extension.LOWERCASE);
        finished=true;app.activeDocument=doc;
        // CEP returns PT_OK after successful $.evalFile; result stays open as editable PSD.
    }catch(e){
        var report='Пилатес 1. Этап: '+step+'. '+e.message+' (строка '+(e.line||'?')+'). Создано слоёв текста: '+countType+', фигур: '+countShape;
        try{if(doc&&!finished)doc.close(SaveOptions.DONOTSAVECHANGES);}catch(closeErr){}
        if(src)try{app.activeDocument=src;}catch(ignoreSrc){}
        throw new Error(report);
    }finally{
        try{app.preferences.rulerUnits=priorUnits;}catch(r){}
        try{app.displayDialogs=priorDialogs;}catch(d){}
    }
})();