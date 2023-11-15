import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const GraphPanel = ({ selectedModule, lowMoistureLevel, highMoistureLevel }) => {
  const data = [
    { date: '2023-11-01T00:00:00Z', moisture: 0.7},
    { date: '2023-11-02T00:00:00Z', moisture: 0.65},
    { date: '2023-11-15T00:00:00Z', moisture: 0.75},
  ];
  const d3Container = useRef(null);

  useEffect(() => {
    if (data && d3Container.current && lowMoistureLevel && highMoistureLevel) {
      const svg = d3.select(d3Container.current);
      const margin = { top: 100, right: 20, bottom: 30, left: 80 };
      const width = d3Container.current.clientWidth - margin.left - margin.right;
      const height = d3Container.current.clientHeight - margin.top - margin.bottom;

      svg.selectAll("*").remove();

      const xScale = d3.scaleTime()
        .domain([new Date(data[0].date), d3.timeDay.offset(new Date(data[data.length - 1].date), 1)])
        .range([0, width]);

      const yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([height, 0]);

      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

      const line = d3.line()
      .x(d => xScale(new Date(d.date)))
      .y(d => yScale(d.moisture))
      .curve(d3.curveMonotoneX);

      const area = d3.area()
        .x(d => xScale(new Date(d.date)))
        .y0(d => yScale(lowMoistureLevel))
        .y1(d => yScale(highMoistureLevel));

      g.append('path')
        .datum(data)
        .attr('class', 'moisture-area')
        .attr('fill', 'lightgreen')
        .attr('d', area);

      g.append('path')
        .datum(data)
        .attr('class', 'moisture-line')
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 2)
        .attr('d', line);

      const tooltip = d3.select(d3Container.current)
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

      g.selectAll('.data-point')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'data-point')
        .attr('cx', d => xScale(new Date(d.date)))
        .attr('cy', d => yScale(d.moisture))
        .attr('r', 5)
        .attr('fill', 'red')
        .on('mouseover', (event, d) => {
          tooltip.transition()
            .duration(200)
            .style('opacity', .9);
          tooltip.html(`Moisture: ${d.value} <br/> Date: ${d.date}`)
            .style('left', (event.pageX) + 'px')
            .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', () => {
          tooltip.transition()
            .duration(500)
            .style('opacity', 0);
        });

      g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

      g.append('g')
        .call(d3.axisLeft(yScale));

      const legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      legend.append('rect')
        .attr('x', width - 120)
        .attr('y', -50)
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', 'lightgreen');

      legend.append('text')
        .attr('x', width - 100)
        .attr('y', -50)
        .text('Moisture Range')
        .attr('text-anchor', 'start')
        .attr('alignment-baseline', 'hanging');
    }
  }, [data, lowMoistureLevel, highMoistureLevel]);

  if(!highMoistureLevel || !lowMoistureLevel) return null;

  return (
    <svg ref={d3Container} style={{ width: '100%', height: '80vh' }} />
  );
};

export default GraphPanel;
