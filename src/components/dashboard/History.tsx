import React from 'react';
import { PieChart } from '@mui/x-charts';

const History: React.FC = () => {
  return (

    <div className="grid grid-cols-6 grid-rows-6 gap-4 bg-white shadow-2xl rounded-lg">
      <div className="col-span-3 row-span-3 p-2 bg-white border rounded-lg m-2"><PieChart
        series={[
          {
            data: [
              { id: 0, value: 10, label: 'series A' },
              { id: 1, value: 15, label: 'series B' },
              { id: 2, value: 20, label: 'series C' },
            ],
          },
        ]}
        width={400}
        height={200}
      /></div>
      <div className="col-span-3 row-span-3 col-start-4 bg-white border rounded-lg m-2"><PieChart
        series={[
          {
            data: [
              { id: 0, value: 10, label: 'series A' },
              { id: 1, value: 15, label: 'series B' },
              { id: 2, value: 20, label: 'series C' },
            ],
          },
        ]}
        width={400}
        height={200}
      /></div>
      <div className="flex items-center justify-center col-span-4 row-span-3 col-start-2 row-start-4 mb-2 rounded-lg border"><PieChart
        series={[
          {
            data: [
              { id: 0, value: 10, label: 'series A' },
              { id: 1, value: 15, label: 'series B' },
              { id: 2, value: 20, label: 'series C' },
            ],
          },
        ]}
        width={400}
        height={200}
      /></div>
    </div>

  )
}

export default History;