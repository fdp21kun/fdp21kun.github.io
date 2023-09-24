google.charts.load('current', {packages: ['corechart', 'line']});
google.charts.setOnLoadCallback(drawChart);

let data;
let options;
let chart;

let strikePrice = 30000;        // 権利行使価格
let futurePrice = 30000;        // 先物価格
let ragePrice   = 1000;         // 価格範囲(片側)
let numData     = 10;           // データ数(片側)
let ftSlope     = 1;            // 先物傾き 1:買、-1:売
let ftICept     = -futurePrice; // 先物 y軸切片
let opSlope     = -1;           // 1:CBPS(Call=Buy,Put=Sel) -1:CSPB(Call=Sell, Put=Buy)
let opCept      = strikePrice;  // オプション y軸切片

function mkData() {
  const xLow = strikePrice - 1000;
  const step = 1000 / numData;
  let d      = [];
  const len  = data.getNumberOfRows();
  data.removeRows(0, len);
  for (let i = 0; i < numData * 2; i++) {
    let x  = xLow + i * step;
    let ft = x * ftSlope + ftICept;
    let op = x * opSlope + opCept;
    let pl = ft + op;
    d.push([x, null, ft, op, pl]);
    if (x == strikePrice) {
      d.push([strikePrice, "", ft, op, pl]);
    }
  }
  data.addRows(d);
}

function drawChart() {
  const opStr = (opSlope > 0) ? "Put売" : "Call売"; 
  data = new google.visualization.DataTable();
  data.addColumn('number', '価格');
  data.addColumn({type: 'string', role: 'annotation'});
  data.addColumn('number', '先物');
  data.addColumn('number', opStr);
  data.addColumn('number', '損益');
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
    curveType: 'function',
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
function getForm()
{
  strikePrice       = Number(document.getElementById('strike').value);  // 権利行使価格
  futurePrice       = Number(document.getElementById('future').value);  // 先物価格
  const callSell    = document.getElementsByName('op_radio')[0].checked ? true : false;
  const futureSell  = document.getElementsByName('ft_radio')[0].checked ? true : false;
  const callPremium = Number(document.getElementById('call').value);  
  const putPremium  = Number(document.getElementById('put').value);
  const premium     = callSell ? callPremium - putPremium : -callPremium + putPremium;
  ftSlope = futureSell  ? -1 : 1;                      // 先物傾き 1:買、-1:売
  opSlope = callSell    ? -1 : 1;                      // 1:CBPS(Call=Buy,Put=Sel) -1:CSPB(Call=Sell, Put=Buy)
  ftICept = ftSlope > 0 ? -futurePrice : futurePrice;  // 先物 y軸切片
  opCept  = opSlope > 0 ? -strikePrice : strikePrice;  // オプション y軸切片
  opCept += premium;
}
function recalc()
{
  //alert("ボタンがクリックされた");
  console.log("タンがクリックされた");
  getForm();
  drawChart();
}
