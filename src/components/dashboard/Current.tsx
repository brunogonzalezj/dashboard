import React from 'react';
import { useDashboardData, useUploadDate } from '../../hooks/queries';
import { DataItem } from '../../interfaces/IData.ts';
import ParticipantsView from './ParticipantsView';

const EMPTY_DATA: DataItem[] = [];

const Current: React.FC = () => {
  const { data = EMPTY_DATA, isLoading } = useDashboardData();
  const { data: uploadDateData } = useUploadDate();

  return (
    <ParticipantsView
      data={data}
      isLoading={isLoading}
      variant="current"
      uploadDate={uploadDateData?.uploadDate}
    />
  );
};

export default Current;
