// PT_SCHEMA={"category":"Пилатес","description":"FW PILATES v3 • брендовый графит, читаемая левая колонка, премиальный постер; весь декор в редактируемых слоях Photoshop","fields":[{"id":"first","label":"Имя","type":"text","default":"Екатерина"},{"id":"last","label":"Фамилия","type":"text","default":"Назарова"},{"id":"studio","label":"Название сети / студии","type":"text","default":"FW PILATES"},{"id":"brandNote","label":"Подпись студии","type":"text","default":"СЕТЬ СТУДИЙ КЛАССИЧЕСКОГО ПИЛАТЕСА"},{"id":"location","label":"Город","type":"text","default":"САНКТ-ПЕТЕРБУРГ"},{"id":"role","label":"Должность","type":"text","default":"СЕРТИФИЦИРОВАННЫЙ ПРЕПОДАВАТЕЛЬ ПИЛАТЕСА"},{"id":"motto","label":"Посыл (до 5 строк)","type":"textarea","default":"ПИЛАТЕС БОЛЬШЕ,\nЧЕМ ТРЕНИРОВКА —\nЭТО ЗАБОТА\nО СЕБЕ"},{"id":"section","label":"Заголовок квалификаций","type":"text","default":"МЕЖДУНАРОДНЫЕ ШКОЛЫ ПИЛАТЕСА:"},{"id":"credentials","label":"Квалификации (5 строк, по одному пункту на строку)","type":"textarea","array":true,"default":"Authentic Pilates Inelia Garcia (Бразилия)\nThe Pilates Standard (Швеция)\nТренер BLACKROLL, миофасциальные методики (Германия)\nТренер по функциональному тренингу, стретчингу\nУчастник международных и российских конвенций и воркшопов"},{"id":"footer","label":"Нижняя подпись","type":"text","default":"ГАРМОНИЯ ДВИЖЕНИЯ   •   СИЛА   •   КОНТРОЛЬ"},{"id":"logoMode","label":"Фирменный знак","type":"select","default":"Стилизованный знак","options":["Стилизованный знак","Только название","Место для оригинального логотипа"]},{"id":"fontTitle","label":"Шрифт имени (нужен установленный в Windows шрифт)","type":"select","default":"Оригинальный","options":["Оригинальный","Arial-BoldMT","Georgia-Bold","Montserrat-Bold","TimesNewRomanPS-BoldMT","BodoniMT-Bold"]},{"id":"photoShift","label":"Сдвиг фото вправо (%) — 0…30","type":"number","default":16},{"id":"shadeStrength","label":"Затемнение текстовой колонки (%) — 0…100","type":"number","default":82}]}
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
    var GOLD='#F1C592',LIGHT='#FCF9F5',MUTED='#E2D7CA',DARK='#131115',PINK='#E93D74',ORANGE='#F9A63A';
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
    function grad(name,angle,op0,op1,opacity,alphaStops,positions){
        step='Нативный градиент: '+name;
        var K=sid,make=new ActionDescriptor(),ref=new ActionReference();ref.putClass(K('contentLayer'));make.putReference(K('null'),ref);
        var layer=new ActionDescriptor(),style=new ActionDescriptor(),gradient=new ActionDescriptor();
        style.putUnitDouble(K('angle'),K('angleUnit'),angle);
        style.putEnumerated(K('type'),K('gradientType'),K('linear'));
        style.putUnitDouble(K('scale'),K('percentUnit'),100);style.putBoolean(K('dither'),true);
        gradient.putString(K('name'),'PhotoTools Pilates v3 dark overlay');
        gradient.putEnumerated(K('gradientForm'),K('gradientForm'),K('customStops'));
        gradient.putDouble(K('interfaceIconFrameDimmed'),4096);
        var colors=new ActionList(),ops=new ActionList();
        for(var i=0;i<2;i++){
            var cs=new ActionDescriptor();
            cs.putObject(K('color'),K('RGBColor'),rgbDesc(DARK));
            cs.putEnumerated(K('type'),K('colorStopType'),K('userStop'));
            cs.putInteger(K('location'),i?4096:0);
            cs.putInteger(K('midpoint'),50);
            colors.putObject(K('colorStop'),cs);
        }
        var al=alphaStops||[op0,op1], pos=positions||[0,4096];
        if(al.length!==pos.length)throw new Error('Несовпадение стопов градиента');
        for(var j=0;j<al.length;j++){
            var os=new ActionDescriptor();
            os.putUnitDouble(K('opacity'),K('percentUnit'),al[j]);
            os.putInteger(K('location'),pos[j]);
            os.putInteger(K('midpoint'),50);
            ops.putObject(K('transferSpec'),os);
        }
        gradient.putList(K('colors'),colors);gradient.putList(K('transparency'),ops);
        style.putObject(K('gradient'),K('gradientClassEvent'),gradient);
        layer.putObject(K('type'),K('gradientLayer'),style);
        make.putObject(K('using'),K('contentLayer'),layer);
        executeAction(K('make'),make,DialogModes.NO);
        var l=doc.activeLayer;l.name=name;l.opacity=Math.max(0,Math.min(100,opacity));return l;
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
        doc=src.duplicate('PhotoTools - Пилатес 1 v3',false);app.activeDocument=doc;
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
        var move=nval('photoShift',16,0,30);
        if(move>0)photo.translate(px(W*move/100),px(0));
        var base=rect('ПОДЛОЖКА / графит за сдвинутой фотографией',0,0,DW,DH,g,DARK,100);
        base.move(photo,ElementPlacement.PLACEAFTER);
    }
    function drawLogo(g){
        var logo=group('ЗНАК FW — заменить официальным логотипом при необходимости');
        var mode=str('logoMode','Стилизованный знак');
        if(mode==='Стилизованный знак'){
            // Векторная стилизация по фирменным цветам. Не подменяет официальный логотип.
            oval('Петля / янтарная',116,56,72,70,logo,null,ORANGE,5,100);
            line('Штрих / коралловый',110,107,5,72,logo,PINK,100,19);
            line('Штрих / алый',132,107,5,67,logo,'#F26B4D',100,19);
            line('Перекладина / коралл',103,119,80,5,logo,'#F47654',100);
            oval('Точка / розовая',88,117,8,8,logo,PINK,null,0,100);
        }
        // Для оригинального логотипа верхняя группа остаётся отдельной:
        // просто вставьте официальный Smart Object поверх стилизации.
        normal('БРЕНД / FW PILATES',str('studio','FW PILATES').toUpperCase(),216,88,30,LIGHT,g,640,165);
        normal('БРЕНД / описание',str('brandNote','СЕТЬ СТУДИЙ КЛАССИЧЕСКОГО ПИЛАТЕСА').toUpperCase(),216,136,12,LIGHT,g,698,87);
        line('ГОРОД / акцент',88,191,53,2,g,GOLD,90);
        normal('ГОРОД',str('location','САНКТ-ПЕТЕРБУРГ').toUpperCase(),87,208,15,LIGHT,g,540,215);
    }
    
    function drawCredentials(g,ico){
        var defaults=[
            'Authentic Pilates Inelia Garcia (Бразилия)',
            'The Pilates Standard (Швеция)',
            'Тренер BLACKROLL, миофасциальные методики (Германия)',
            'Тренер по функциональному тренингу, стретчингу',
            'Участник международных и российских конвенций и воркшопов'
        ];
        var a=arr('credentials',defaults);
        var ys=[834,950,1066,1182,1298];
        for(var i=0;i<5;i++){
            var v=trim(a[i]||'');if(!v)continue;
            var y=ys[i], prefix='0'+(i+1)+' / ';
            circle(prefix+'рамка',84,y+4,56,ico,1.7,98);
            if(i===0){
                circle('Глобус / параллель',98,y+18,28,ico,1.1,95);
                line('Глобус / экватор',103,y+32,19,1.6,ico,GOLD,95);
                line('Глобус / меридиан',111,y+20,1.6,24,ico,GOLD,95);
            }else if(i===1){
                line('Диплом / левый край',103,y+19,2,29,ico,GOLD);
                line('Диплом / правый край',121,y+19,2,29,ico,GOLD);
                line('Диплом / верх',103,y+19,20,2,ico,GOLD);
                line('Диплом / низ',103,y+46,20,2,ico,GOLD);
                line('Диплом / текст',107,y+32,11,2,ico,GOLD);
            }else if(i===2){
                oval('Ролл / внешний',102,y+23,25,21,ico,null,GOLD,1.5,96);
                circle('Ролл / центр',110,y+28,10,ico,1.2,95);
            }else if(i===3){
                line('Гриф',98,y+33,29,2,ico,GOLD);
                line('Диск левый',103,y+26,3,17,ico,GOLD);
                line('Диск правый',120,y+26,3,17,ico,GOLD);
            }else{
                circle('Семинар / звезда центр',107,y+27,13,ico,1.4,97);
                line('Звезда / луч 1',112,y+19,2,8,ico,GOLD);
                line('Звезда / луч 2',112,y+40,2,8,ico,GOLD);
                line('Звезда / луч 3',99,y+33,8,2,ico,GOLD);
                line('Звезда / луч 4',120,y+33,8,2,ico,GOLD);
            }
            var country='',head=v;
            var m=v.match(/\s*\(([^()]+)\)\s*$/);
            if(m){country='('+m[1]+')';head=trim(v.slice(0,m.index));}
            // Отдельно форматируем три варианта квалификаций, чтобы
            // они вмещались в единую вертикальную сетку.
            var rows=parts(head,31,2);
            for(var k=0;k<Math.min(2,rows.length);k++){
                if(rows[k])normal('КВАЛИФИКАЦИЯ '+(i+1)+' / '+(k+1),rows[k],165,y+7+k*25,21,LIGHT,g,420,0);
            }
            if(country) normal('КВАЛИФИКАЦИЯ '+(i+1)+' / страна',country,165,y+58,18,GOLD,g,410,50);
            if(i<4) line('РАЗДЕЛИТЕЛЬ '+(i+1),164,y+101,350,1.3,g,GOLD,43);
        }
    }
    
    function compose(){
        var strength=nval('shadeStrength',82,0,100);
        var overlay=group('01 ЧИТАЕМОСТЬ — градиенты Photoshop');
        // Основной градиент: поддержка текста примерно до 51% ширины,
        // прозрачность у лица. Каждый слой можно выключить/ослабить.
        into(grad('ЛЕВЫЙ / плотный фон для текста',0,100,0,strength,
            [100,97,62,0,0],[0,1150,1900,2750,4096]),overlay);
        into(grad('ЛЕВЫЙ / дополнительная плотность',0,100,0,Math.round(strength*0.34),
            [100,90,0,0],[0,1600,2600,4096]),overlay);
        into(grad('НИЖНИЙ / подпись',90,70,0,Math.round(strength*0.48)),overlay);
        into(grad('ВЕРХНИЙ / читаемость шапки',90,32,0,Math.round(strength*0.16)),overlay);

        var arcs=group('02 ДЕКОР — векторные дуги и линии');
        oval('ДУГА / справа за моделью',744,-240,900,1370,arcs,null,GOLD,1.7,33);
        oval('ДУГА / справа снизу',823,537,1010,760,arcs,null,GOLD,1.6,31);
        line('ПОСЫЛ / вертикальный акцент',73,291,2,138,arcs,GOLD,83);
        line('ПОСЫЛ / нижний штрих',88,449,65,2,arcs,GOLD,93);
        line('РАЗДЕЛИТЕЛЬ / после должности',84,755,476,2,arcs,GOLD,72);
        line('НИЖНИЙ ШТРИХ / верх',84,1428,850,1.6,arcs,GOLD,86);

        var brand=group('03 БРЕНД / FW PILATES — редактируемые слои');
        drawLogo(brand);

        var mottoGroup=group('04 ЦИТАТА — редактируемый текст');
        var mottos=arr('motto',['ПИЛАТЕС БОЛЬШЕ,','ЧЕМ ТРЕНИРОВКА —','ЭТО ЗАБОТА','О СЕБЕ']);
        for(var i=0;i<Math.min(5,mottos.length);i++){
            if(trim(mottos[i]))serif('ФРАЗА / '+(i+1),trim(mottos[i]).toUpperCase(),96,291+i*29,18,GOLD,mottoGroup,328,170);
        }

        var name=group('05 ИМЯ / должность');
        normal('ИМЯ',str('first','Екатерина').toUpperCase(),78,490,64,LIGHT,name,490,14);
        title('ФАМИЛИЯ',str('last','Назарова').toUpperCase(),76,569,88,GOLD,name,525,-10);
        var role=parts(str('role','СЕРТИФИЦИРОВАННЫЙ ПРЕПОДАВАТЕЛЬ ПИЛАТЕСА').toUpperCase(),27,2);
        for(var j=0;j<role.length;j++)
            normal('ДОЛЖНОСТЬ / '+(j+1),role[j],84,686+j*30,19,LIGHT,name,505,120);

        var info=group('06 ОБРАЗОВАНИЕ — текст, пять пунктов');
        normal('ОБРАЗОВАНИЕ / заголовок',str('section','МЕЖДУНАРОДНЫЕ ШКОЛЫ ПИЛАТЕСА:').toUpperCase(),84,782,17,GOLD,info,505,83);
        var icons=group('07 ИКОНКИ — редактируемые векторы');
        drawCredentials(info,icons);

        var footer=group('08 ПОДПИСЬ / низ');
        normal('ПОДПИСЬ / гармония движения',str('footer','ГАРМОНИЯ ДВИЖЕНИЯ   •   СИЛА   •   КОНТРОЛЬ').toUpperCase(),84,1460,21,GOLD,footer,850,110);
    }
    
    function countChildren(g){var n=0;for(var i=0;i<g.layers.length;i++)n++;return n;}
    function safeName(s){return s.replace(/\.[^.]*$/,'').replace(/[\\\/:*?"<>|]/g,'_').substr(0,55);}
    try{
        if(!app.documents.length)throw new Error('Открой фотографию в Photoshop.');
        app.displayDialogs=DialogModes.NO;app.preferences.rulerUnits=Units.PIXELS;
        copySource();compose();step='Сохранение многослойного PSD';
        var folder=new Folder(Folder.userData.fsName+'/PhotoTools/StudioSuite/OUTPUT');
        if(!folder.exists&&!folder.create())throw new Error('Не могу создать каталог OUTPUT.');
        var name=safeName(src.name)+'_PILATES_1_V3',f=new File(folder.fsName+'/'+name+'.psd'),k=2;
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