/**
 * Created by hen on 3/18/14.
 */

function BrushableScale(ctx, svg, width, updateFunctionNameInCtx, redrawFunctionNameInCtx, scaleNameInCtx, params){



//    var svg = d3.select("#vis").append("svg").attr({
//        width:800,
//        height:800
//    })

    var offsetX=0,
        offsetY=0;

    var distanceBetweenAxis = 25; // distance between two scales
    var distanceBetweenUpperAndLower = 20 // should be fix !!
//        height=20;


    var width = width;

    var xScale = d3.scale.linear().domain([1,width]).range([0, width])
    var xOverViewAxisUpper = d3.svg.axis().scale(xScale);
    var xOverViewAxisLower = d3.svg.axis().scale(xScale).orient("top").tickFormat(function(d){return ""});


    var xDetailScale = d3.scale.linear().domain([0,width]).range([0,width]).clamp(true)
    var xDetailAxisUpper = d3.svg.axis().scale(xDetailScale);
    var xDetailAxisLower = d3.svg.axis().scale(xDetailScale).orient("top").tickFormat(function(d){return ""});

    var param = param

    var maxValue = 100;

    var labels=[
        {name: "largest intersection",id:"I", value:100 },
        {name: "largest group",id:"G", value:200 },
        {name: "largest set",id:"S", value:300 },
        {name: "all items",id:"A", value:400 }
    ]



    var connectionAreaData =[
        [0,-distanceBetweenAxis],
        [100,-distanceBetweenAxis],
        [width,0]
    ]


    // add axis
    svg.append("g").attr({
        "class":"x overviewAxisUpper axis",
        "transform":"translate("+offsetX+","+offsetY+")"
    }).call(xOverViewAxisUpper)


    svg.append("g").attr({
        "class":"x overviewAxisLower axis",
        "transform":"translate("+offsetX+","+(offsetY+distanceBetweenUpperAndLower)+")"
    }).call(xOverViewAxisLower)

    svg.append("g").attr({
        "class":"x detailAxisUpper axis",
        "transform":"translate("+offsetX+","+(offsetY+distanceBetweenAxis+distanceBetweenUpperAndLower)+")"
    }).call(xDetailAxisUpper)

    svg.append("g").attr({
        "class":"x detailAxisLower axis",
        "transform":"translate("+offsetX+","+(offsetY+distanceBetweenAxis+2*distanceBetweenUpperAndLower)+")"
    }).call(xDetailAxisLower)

//    svg.append("path").attr({
//        class:"connectionArea",
//        "transform":"translate("+offsetX+","+offsetY+")"
//    })


    var sliders;
    var overViewBrushDef;
    var overviewBrush;
    var redrawFunction = ctx[redrawFunctionNameInCtx];


    // brushed function
    var brushed = function(){
        var endRange = overViewBrushDef.extent()[1];

        svg.select(".drawBrush").attr({
            width:xScale(endRange)
        });

        xDetailScale.domain([0,endRange]);
        xDetailAxisUpper.scale(xDetailScale);
        xDetailAxisLower.scale(xDetailScale);

        svg.selectAll(".detailAxisUpper").call(xDetailAxisUpper);
        svg.selectAll(".detailAxisLower").call(xDetailAxisLower);

        connectionAreaData[1][0]= xScale(endRange);
        updateConnectionArea()
        if (redrawFunction!=null) redrawFunction();
        ctx[scaleNameInCtx] = xDetailScale;
    };

    var setBrush= function(size){
//        var sizeB =xScale(size);
//        console.log(xScale.domain(), sizeB, size, xScale.range());
        overViewBrushDef.extent([0,size]);
//        overviewBrush.select(".e").attr({
//            "transform":"translate("+xScale(size)+","+0+")"
//        })
        overviewBrush.call(overViewBrushDef)
        brushed();
    }




    var update = function(params){
        if (params.maxValue !=null) maxValue= params.maxValue;
        if (params.labels !=null) labels = params.labels;

        updateScales();
        updateSliderLabels();
    }

    function init(){
        // define slider
        overViewBrushDef = d3.svg.brush()
            .x(xScale)
            .extent([0, 100])
            .on(
                "brush", brushed
            );

        sliders = svg.append("g").attr({
            class: "sliderGroup",
            "transform": "translate(" + offsetX + "," + (offsetY) + ")"
        });

        sliders.append("g").attr({
            class:"labels"
        })

        sliders.append("rect").attr({
            class:"drawBrush",
            x:0,
            y:0,
            height:distanceBetweenUpperAndLower,
            width:overViewBrushDef.extent()[1]
        })

        overviewBrush = sliders.append("g").attr({
            class:"slider"
        }).call(overViewBrushDef)

        overviewBrush.selectAll(".w, .extent,  .background").remove();

        overviewBrush.selectAll("rect").attr({
            height:50,
            width:20
        })
        overviewBrush.selectAll(".e")
            .append("rect")
            .attr({
                "class":"handle"
            })
        overviewBrush.selectAll("rect").attr({
            transform:"translate(0,"+(distanceBetweenUpperAndLower/2)+")rotate(45)",
            x:-5,
            y:-5,
            height:10,
            width:10
        })

    }

    function updateScales(){

        var brushedValue = d3.min([overViewBrushDef.extent()[1], maxValue]);
        xScale = d3.scale.linear().domain([0,maxValue]).range([0, width])
        xOverViewAxisUpper.scale(xScale);
        xOverViewAxisLower.scale(xScale);

//        xDetailScale = d3.scale.linear().domain([0,brushedValue]).range([0,width])
//        xDetailAxisUpper.scale(xDetailScale);
//        xDetailAxisLower.scale(xDetailScale);

        svg.select(".x.overviewAxisUpper.axis").call(xOverViewAxisUpper)
        svg.select(".x.overviewAxisLower.axis").call(xOverViewAxisLower)
//        svg.select(".x.detailAxisUpper.axis").call(xDetailAxisUpper)
//        svg.select(".x.detailAxisLower.axis").call(xDetailAxisLower)

        // do NOT redraw !
        overViewBrushDef.x(xScale)
        var saveRedraw = redrawFunction;
        redrawFunction = null;
        setBrush(brushedValue);
        redrawFunction = saveRedraw;

    }

    function updateSliderLabels(){
        console.log("updateSlider",labels);

        // slider labels
        var sliderLabels = sliders.select(".labels").selectAll(".sliderLabel").data(labels, function(d){return d.id})
        sliderLabels.exit().remove();
        var sliderLabelsEnter = sliderLabels.enter().append("g").attr({
            class:"sliderLabel"
        });

        sliderLabelsEnter.append("rect").attr({
            x:-5,
            y:0,
            width:10,
            height:15
        })

            .append("svg:title").text( function(d){return d.name})

        sliderLabelsEnter.append("line").attr({
            x1:0,
            x2:0,
            y1:15,
            y2:20
        })
        sliderLabelsEnter.append("text").text(function(d){return d.id}).attr({
            dy:"1em",
            "pointer-events":"none"
        })

        sliderLabels.attr({
            "transform":function(d){return "translate("+xScale(d.value)+","+(-20)+")"}
        }).on({
                "click":function(d){console.log(d); setBrush(d.value);}
            })

    }

    function updateConnectionArea(){
        var cAreaNode = svg.selectAll(".connectionArea").data([connectionAreaData])
        cAreaNode.exit().remove();
        cAreaNode.enter().append("path")
            .attr({
                class:"connectionArea",
                "transform":"translate("+offsetX+","+(offsetY+distanceBetweenUpperAndLower+distanceBetweenAxis)+")",
                color:function(d){console.log(d);}
            })
        cAreaNode.attr({
            d:d3.svg.area()
        })

    }


    init();

    updateSliderLabels();
    updateConnectionArea();
//    updateScales();

    ctx[updateFunctionNameInCtx]=function(d,params){update(params);};

}

