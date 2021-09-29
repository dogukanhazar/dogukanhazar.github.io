function getUniqueMonthsFromData(raw) {
	const months = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec',
	];
	return raw?.reduce((acc, data) => {
		const monthName = months[new Date(Date.parse(data?.date))?.getMonth()];
		!acc?.includes(monthName) && acc?.push(monthName);
		return acc;
	}, []);
}

function changesTableGenerator(options = {}) {
	let changesTableInHtml = `
<table class="table table-striped table-bordered table-hover">
	<thead class="thead-light">
		<tr>
			<th scope="col">#</th>
			<th scope="col">Date</th>
			<th scope="col">Initial Price</th>
			<th scope="col">Market Price</th>
			<th scope="col">Change</th>
		</tr>
	</thead>
	<tbody>
`;
	changesArr?.forEach((c, index) => {
		changesTableInHtml += `
	<tr>
		<th scope="row">${index}</th>
		<th>${c?.date}</th>
		<th>${c?.initialPrice}</th>
		<th>${c?.marketPrice}</th>
		<th>${c?.change}</th>
	</tr>
	`;
	});
	changesTableInHtml += `
	</tbody>
</table>
`;
	options?.reset
		? $('#changesTable').empty()
		: $('#changesTable').html(changesTableInHtml);
}

function getFormattedDate(timestamp) {
	const _strftime = 'YYYY/MM/DD';
	return moment(timestamp).format(_strftime);
}

function highChartCustomTooltipGenerator() {
	const _priceDecimals = 2;
	const _priceSuffix = ' EUR';
	let _customTooltipInHtml = '';
	const _headerContent = getFormattedDate(this?.points[0]?.key);
	_customTooltipInHtml += `
						<table>
							<tr>
								<th colspan="2">${_headerContent}<hr></th>
							</tr>`;
	this?.points?.forEach((point) => {
		const _price = Number(point?.y).toFixed(_priceDecimals);
		const _initialPrice = Number(point?.point?.initialPrice)?.toFixed(
			_priceDecimals
		);
		const _name = point?.series?.name;
		const _color = point?.series?.color;
		_customTooltipInHtml += `
							<tr>
								<td style="color: ${_color}">${_name} </td>
								<td style="text-align: right"><b>${_price}${_priceSuffix}</b></td>
							</tr>
							`;
		if (_name === 'Market Price') {
			_customTooltipInHtml += `
							<tr>
								<td style="color: ${_color}">Change </td>
								<td style="text-align: right"><b>${(_price - _initialPrice)?.toFixed(
									_priceDecimals
								)}${_priceSuffix}</b></td>
							</tr>
							<tr>
								<td style="color: ${_color}">Initial Price </td>
								<td style="text-align: right"><b>${_initialPrice}${_priceSuffix}</b></td>
							</tr>
							`;
		}
	});
	_customTooltipInHtml += '</table>';
	return _customTooltipInHtml;
}

function highChartGetSeries(data, data2) {
	return [
		{
			type: 'area',
			data: data?.map((d) => ({
				id: d?.id,
				initialPrice: d?.price - 10,
				x: Date.parse(d?.date),
				y: d?.price,
			})),
			name: 'Market Price',
			cursor: 'ns-resize',
			dragDrop: {
				draggableY: true,
			},
			marker: {
				enabled: true,
			},
			// visible: false,
			// zoneAxis: 'x',
			/* zones: [
							{
								value: 0,
								color: '#f7a35c',
							},
							{
								value: 500,
								color: '#7cb5ec',
							},
							{
								color: '#90ed7d',
							},
						], */
		},
		{
			data: data2?.map((d) => ({
				id: d?.id,
				x: Date.parse(d?.date),
				y: d?.price,
			})),
			name: 'Reference',
			color: '#385e8c',
			opacity: 0.5,
		},
	];
}

function highChartConfigGenerator(data, data2) {
	const highChartConfig = {
		chart: {
			animation: true,
			zoomType: 'x',
		},
		title: {
			text: 'Demo HighChart',
		},
		subtitle: {
			text:
				document.ontouchstart === undefined
					? 'Click and drag in the plot area to zoom in'
					: 'Pinch the chart to zoom in',
		},
		xAxis: {
			// categories: data?.map((d) =>
			// 	moment(new Date(Date.parse(d?.date))).format('YYYY/MM/DD')
			// ),
			type: 'datetime',
			crosshair: true,
			title: {
				text: 'Date',
			},
		},
		yAxis: {
			// softMin: -200,
			// softMax: 400,
			title: {
				text: 'Price',
			},
		},
		legend: {
			layout: 'vertical',
			align: 'top',
			verticalAlign: 'top',
		},
		plotOptions: {
			series: {
				lineWidth: 0.85,
				stickyTracking: false,
				marker: {
					enabled: false,
				},
				point: {
					events: {
						dragStart: function (e) {
							console.log('Drag Start');
						},
						drag: function (e) {
							console.log('Drag');
						},
						drop: function (e) {
							console.log('Drop', e);
							const _initialPrice = e.target?.initialPrice?.toFixed(2);
							const _marketPrice = e.target?.y?.toFixed(2);
							const updatedData = {
								id: e.target?.id,
								date: getFormattedDate(e.target?.x),
								initialPrice: _initialPrice,
								marketPrice: _marketPrice,
								change: (_marketPrice - _initialPrice).toFixed(2),
							};
							const updatedDataIndex = changesArr?.findIndex(
								(c) => c?.id === e.target?.id
							);
							if (updatedDataIndex === -1) {
								changesArr.push(updatedData);
							} else {
								changesArr[updatedDataIndex] = updatedData;
							}
							changesTableGenerator();
						},
					},
				},
			},
			/* column: {
						stacking: 'normal',
						minPointLength: 2,
					}, */
			/* line: {
						cursor: 'ns-resize',
					}, */
			area: {
				lineWidth: 0.85,
				fillColor: {
					linearGradient: {
						x1: 0,
						y1: 0,
						x2: 0,
						y2: 1,
					},
					stops: [
						[0, Highcharts.getOptions().colors[0]],
						[
							1,
							Highcharts.color(Highcharts.getOptions().colors[0])
								.setOpacity(0)
								.get('rgba'),
						],
					],
				},
				marker: {
					radius: 2,
				},
				states: {
					hover: {
						lineWidth: 1,
					},
				},
				threshold: null,
			},
		},
		tooltip: {
			formatter: highChartCustomTooltipGenerator,
			shared: true,
			useHTML: true,
			/* valueDecimals: 2,
					xDateFormat: '%Y/%m/%d',
					headerFormat: '<table><tr><th colspan="2">{point.key}</th></tr>',
					pointFormat:
						'<tr><td style="color: {series.color}">{series.name} </td>' +
						'<td style="text-align: right"><b>{point.y}</b></td></tr>',
					footerFormat: '</table>',
					valueSuffix: ' EUR', */
		},
		series: highChartGetSeries(data, data2),
	};

	return highChartConfig;
}

let chartJs, highChart, mockData, mockData2;
let isHighChartActive = true;
let chartJsDivIdName = 'myChartJs';
let chartJsCanvasIdName = 'myChartJsCanvas';
let highChartDivIdName = 'myHighChart';
let changesArr = [];

let chartJsGradient = $(`#${chartJsCanvasIdName}`)
	.get(0)
	.getContext('2d')
	.createLinearGradient(0, 0, 0, 400);
chartJsGradient.addColorStop(0, 'rgba(250,174,50,1)');
chartJsGradient.addColorStop(1, 'rgba(250,174,50,0)');

$(document).ready(function () {
	$.getJSON('mock.json', function (data, textStatus, jqXHR) {
		$.getJSON('mock2.json', function (data2) {
			const chartJsConfig = {
				type: 'line',
				data: {
					// labels: data?.map((d) => d?.date),
					datasets: [
						{
							label: data[0]?.season,
							data: data?.map((d) => ({
								x: moment(new Date(Date.parse(d?.date))).format('YYYY/MM/DD'),
								y: d?.price,
							})),
							fill: true,
							// fillColor: gradient,
							backgroundColor: chartJsGradient,
							borderColor: 'rgb(255, 99, 132)',
							pointStyle: 'rect',
						},
						{
							label: data2[0]?.season,
							data: data2?.map((d) => ({
								x: moment(new Date(Date.parse(d?.date))).format('YYYY/MM/DD'),
								y: d?.price,
							})),
							backgroundColor: 'rgb(152, 99, 132)',
							borderColor: 'rgb(152, 99, 132)',
						},
					],
				},
				options: {
					interaction: {
						mode: 'index',
						intersect: true,
					},
					scales: {
						x: {
							type: 'time',
							time: {
								tooltipFormat: 'YYYY/MM/DD',
							},
							display: true,
							title: {
								display: true,
								text: 'Date',
							},
						},
						y: {
							// dragData: false // disables datapoint dragging for the entire axis
							display: true,
							title: {
								display: true,
								text: 'Price',
							},
						},
					},
					elements: {
						line: {
							borderWidth: 0.85,
						},
						point: {
							radius: 2,
						},
					},
					plugins: {
						dragData: {
							round: 2, // rounds the values to n decimal places
							// in this case 1, e.g 0.1234 => 0.1)
							showTooltip: true, // show the tooltip while dragging [default = true]
							// dragX: true // also enable dragging along the x-axis.
							// this solely works for continous, numerical x-axis scales (no categories or dates)!
							onDragStart: function (e, element) {
								/*
          // e = event, element = datapoint that was dragged
          // you may use this callback to prohibit dragging certain datapoints
          // by returning false in this callback
          if (element.datasetIndex === 0 && element.index === 0) {
            // this would prohibit dragging the first datapoint in the first
            // dataset entirely
            return false
          }
          */
							},
							onDrag: function (e, datasetIndex, index, value) {
								// myChart.update();
								/*     
          // you may control the range in which datapoints are allowed to be
          // dragged by returning `false` in this callback
          if (value < 0) return false // this only allows positive values
          if (datasetIndex === 0 && index === 0 && value > 20) return false 
          */
							},
							onDragEnd: function (e, datasetIndex, index, value) {
								// you may use this callback to store the final datapoint value
								// (after dragging) in a database, or update other UI elements that
								// dependent on it
							},
						},
					},
					onHover: function (e, el) {
						e.native.target.style.cursor = !!el?.length
							? 'ns-resize'
							: 'default';
					},
				},
			};
			mockData = data;
			mockData2 = data2;

			chartJs = new Chart(chartJsCanvasIdName, chartJsConfig);
			highChart = Highcharts.chart(
				highChartDivIdName,
				highChartConfigGenerator(data, data2)
			);
		});
	});
	if (isHighChartActive) {
		$('#chartInfo').text('HIGH CHART');
		$(`#${chartJsDivIdName}`).hide();
		$(`#${highChartDivIdName}`).show();
	} else {
		$('#chartInfo').text('CHART JS');
		$(`#${highChartDivIdName}`).hide();
		$(`#${chartJsDivIdName}`).show();
	}
});

$('#switchButton').click(function () {
	isHighChartActive = !isHighChartActive;
	if (isHighChartActive) {
		$('#chartInfo').text('HIGH CHART');
		$(`#${chartJsDivIdName}`).hide();
		$(`#${highChartDivIdName}`).show();
	} else {
		$('#chartInfo').text('CHART JS');
		$(`#${highChartDivIdName}`).hide();
		$(`#${chartJsDivIdName}`).show();
	}
});

$('#resetChart').click(function (e) {
	e.preventDefault();
	changesArr = [];
	changesTableGenerator({ reset: true });
	highChart = Highcharts.chart(
		highChartDivIdName,
		highChartConfigGenerator(mockData, mockData2)
	);
});
