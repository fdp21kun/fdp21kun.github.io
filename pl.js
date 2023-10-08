google.charts.load('current', {packages: ['corechart', 'line']});
google.charts.setOnLoadCallback(drawChart);

const priceMargin = 500;        // グラフの上下限価格、最大最小権利行使価格からの距離 

let data;
let options;
let chart;

let strikePrice = [];           // 権利行使価格
let callPut     = [];           // Call/Put
let premium     = [];           // プレミアム
let volume      = [];           // 数量
let numCP       = 0;            // C/Pデータ数
let maxCP       = 12;           // C/P データ行数
let numFT       = 0;            // 先物データ数
let maxFT       = 6;            // 先物データ行数
let lower       = 1000000;
let upper       = 0;
//
// データの取得
//
function acquire() {
  numCP     = 0;
  strikePrice = [];           // 権利行使 or 先物価格
  callPut     = [];           // Call/Put/Future
  premium     = [];           // プレミアム
  volume      = [];           // 数量 
  for (let i = 0; i < (maxCP + maxFT); i++){
      const n      =  String(i + 1);
      const buy    = Number(document.getElementById("buy"    + n).value);
      const strike = Number(document.getElementById("strike" + n).value);
      const cp     = document.getElementById("toggle" + n).checked;
      if (buy == 0) continue;
      if ( i < maxCP ) {      // C/P
        const prem    = Number(document.getElementById("prem"   + n).value);
        premium.push(prem);
        callPut.push(cp ? "P" : "C");
      } else {                // 先物
        premium.push(0);
        callPut.push(cp ? "M" : "μ");       
      }
      strikePrice.push(strike);
       volume.push(buy);
      numCP++;
      if (lower > strike - priceMargin) {
        lower = strike - priceMargin;
      }
      if (upper < strike + priceMargin) {
        upper = strike + priceMargin;
      }
  }
}

function sample( strike, cp, prem, buy){
  const offset = buy < 0 ? prem : -prem;  // 売りならプレミアム分+
  let y;
  let s = [];
  for (let p = lower; p <= upper; p += 125) {
    y = offset;
    if (cp == "P") {                      // put
      if ( p <= strike) {
        y += (strike - p) * buy;
      }
    } else if (cp == "C") {               // call       
      if ( p >= strike) {
        y += (p - strike) * buy;  
      }
    } else if (cp == "μ") {               // マイクロ先物
        y += (p - strike) * buy * 0.1;
    } else if (cp == "M") {               // ミニ先物
        y += (p - strike) * buy;
    } else {
      alert("種別(C/P/F)エラー:" + cp);
    }
    s.push(y);
  }
  return s;
}

function mkData() {
  let s      = [];
  for (let i = 0; i < numCP; i++) {
    s.push(sample(strikePrice[i], callPut[i], premium[i], volume[i]));
  }
  let d = [];
  let i = 0;
  for (let p = lower; p <= upper; p += 125, i++) {
    let t   = [];
    let sum = 0;
    t.push(p);
    for (let j = 0; j < numCP; j++) {
      t.push(s[j][i]);
      sum += s[j][i];
    }
    t.push(sum);
    d.push(t);
  } 
  data.addRows(d);
}

function drawChart() {
  if (numCP == 0) return;

  if (data != undefined) {
    delete data;
  }
  data = new google.visualization.DataTable();
  data.addColumn('number', '価格');
  let str;
  for (let i = 0; i < numCP; i++) {
    str = callPut[i] + String(strikePrice[i]) + ((volume[i] < 0) ? "売" : "買");
    data.addColumn('number', str);
  }
  data.addColumn('number', '合成');
  mkData();
  options = {
    // hAxis: {
    //   title: '価格'
    // },
    // vAxis: {
    //   title: '損益'
    // },
    backgroundColor: '#f1f8e9',
    series: {
      0: { color: 'navy' },
      1: { color: 'purple' }
    },
    curveType: 'none',
    crosshair: {
      trigger: 'both',
      focused: {
        color: 'green',
        opacity: 0.1,
        orientation: 'vertical'
      },
      selected: {
        color: 'aqua',
        opacity: 0.1,
        orientation: 'horizontal'
      },
    },
    tooltip: {
      trigger: 'both'
    },
    focusTarget: 'category',
    annotations: {
      style: 'line'
    }
  };

  chart = new google.visualization.LineChart(document.getElementById('linechart_material'));
  chart.draw(data,  options);
}

function recalc()
{
  //alert("ボタンがクリックされた");
  console.log("タンがクリックされた");
  acquire();
  drawChart();
}

