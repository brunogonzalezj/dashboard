import React from 'react';
import { useHistoryData } from '../../hooks/queries';
import { DataItem } from '../../interfaces/IData.ts';
import ParticipantsView from './ParticipantsView';

const EMPTY_DATA: DataItem[] = [];

const Historic: React.FC = () => {
  const { data = EMPTY_DATA, isLoading } = useHistoryData();
  return <ParticipantsView data={data} isLoading={isLoading} variant="historic" />;
};

export default Historic;
