import React, { PureComponent } from 'react';
import { PanelProps, PanelEditorProps, PanelPlugin, PanelOptionsGroup, FormField } from '@grafana/ui';

import ReactEcharts from 'echarts-for-react';

//const JsonEditor = require('jsoneditor-react');



interface MyPanelOptions {
  options1: any;
  chart_json: string;
}

var option1 = {
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      data: [120, 200, 150, 80, 70, 110, 130],
      type: 'bar',
    },
  ],
};

var transformData = function(data: any, how: string, params: any) {
  if ((how = 'multiseries')) {
    var x: any = [];
    var y: any = [];
    var res: any = {};

    for (var d in data) {
      //console.log(data[d][1]);
      x.push(data[d][0]);
      for (var y_ in data[d][1]) {
        try {
          y[data[d][1][y_][0]].push(data[d][1][y_][1]);
        } catch (err) {
          y[data[d][1][y_][0]] = [];
          y[data[d][1][y_][0]].push(data[d][1][y_][1]);
        }
      }
    }
    var series: any = [];
    var legend: any = [];
    Object.keys(y).forEach(function(key) {
      var type: string = '';
      var lineType: string = 'solid';
      var stack: any = null;
      if ('stack' in params){
        stack = params.stack;
      };
      try{
        type = params.type_custom[key];
        lineType = params.lineType[key]; 
      } catch {
        type = params.type;
      }
      series.push({
        name: key,
        stack: stack,
        smooth: params.smooth,
        data: y[key],
        type: type,
        itemStyle: {
          color: params.lineColor[key],
        },
        lineStyle: {
          type: lineType,
          width: params.lineWidth,
          color: params.lineColor[key],
        },
        label: {
          show: params.showLabel,
          fontsize: 10,
        },
      });
      legend.push(key);
    });
    res.x = x;
    res.y = series;
    res.legend = legend;
    return res;
  } else {
    return {};
  }
};

export class MyPanel extends PureComponent<PanelProps<MyPanelOptions>> {

  render() {
    try {
      var settings = JSON.parse(this.props.options.chart_json);
      var params = settings.params;
      var opt = settings.chart_options;
      console.log(settings);
    } catch (err) {
      return <h2>JSON parsing error</h2>;
    }
    var data = transformData(this.props.data.series[0].rows, 'multiseries', params);
    console.log(data);
    console.log(this.props.data);
    opt.xAxis.data = data.x;
    opt.series = data.y;

    opt.legend = {
      data: data.legend,
      show: true,
      type: 'plain',
      bottom: 20,
    };

    console.log(opt);

    // var opt = this.props.options.options1;
    //opt.series[0].type = this.props.options.chart_type;
    try {
      return <ReactEcharts option={opt} style={{ height: '100%', width: '100%' }} notMerge={true} />;
    } catch (err) {
      return <h2>JSON parsing error</h2>;
    }
  }
}

export class MyPanelEditor extends PureComponent<PanelEditorProps<MyPanelOptions>> {
  onTextChanged = (evt: any) => {
    this.props.onOptionsChange({
      ...this.props.options,
      chart_json: evt.target.value,
    });
    // console.log(this.props.options.chart_type);
  };

  onStatsPickerChanged = (evt: any) => {};

  onColorChanged = (evt: any) => {};

  onUnitPickerChanged = (evt: any) => {};
  render() {
    return (
      <PanelOptionsGroup title="My panel options">
        <FormField 
          label="chart json" 
          onBlur={this.onTextChanged} 
          defaultValue={this.props.options.chart_json} 
          inputWidth={100}
          inputEl={
            React.createElement('textarea', 
                                          {
                                            rows: 10,
                                            cols:150,
                                            defaultValue:this.props.options.chart_json,
                                            onBlur: this.onTextChanged
                                          }
                                        )
                      
          }
           />
          
      </PanelOptionsGroup>
    );
  }
}

export const plugin = new PanelPlugin(MyPanel);
plugin.setDefaults({ options1: option1, chart_json: '' });
plugin.setEditor(MyPanelEditor);
