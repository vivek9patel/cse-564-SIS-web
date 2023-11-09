import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { Paper } from '@mui/material';

const GraphPanel = () => {
  const d3Container = useRef(null);
  const data = [
    { timestamp: new Date().setHours(0, 0, 0, 0), moistureLevel: 20 },
    { timestamp: new Date().setHours(2, 0, 0, 0), moistureLevel: 25 },
  ];

  useEffect(() => {
    if (data && d3Container.current) {
      // Get the dimensions of the parent container
      const containerWidth = d3Container.current.getBoundingClientRect().width;
      const containerHeight = d3Container.current.getBoundingClientRect().height;

      const margin = { top: 40, right: 40, bottom: 40, left: 40 };
      const width = containerWidth - margin.left - margin.right;
      const height = containerHeight - margin.top - margin.bottom;

      // Create the root SVG element
      const svg = d3.select(d3Container.current)
        .html("") // Clear svg content before adding new elements
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Define the scales
      const x = d3.scaleTime()
        .domain(d3.extent(data, d => new Date(d.timestamp)))
        .range([0, width]);

      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.moistureLevel)])
        .range([height, 0]);

      // Add the X-axis
      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));

      // Add the Y-axis
      svg.append('g')
        .call(d3.axisLeft(y));

      // Add the line
      svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1.5)
        .attr('d', d3.line()
          .x(d => x(new Date(d.timestamp)))
          .y(d => y(d.moistureLevel))
        );
    }
  }, [data]); // Dependency array includes data but not the ref, as the ref itself does not change

  return (
        <Paper style={{margin: "20px 10px 0 40px"}}>
            <div
                ref={d3Container}
                style={{display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center", height: '80vh'}}
            />
        </Paper>
  );
};

export default GraphPanel;
