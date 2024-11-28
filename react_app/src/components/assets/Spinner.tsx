import React from 'react';
import ReactLoading from 'react-loading';

export const Spinner: React.FC = () => (
  <div className="flex items-center justify-center h-screen">
    <ReactLoading type={'cubes'} color={'#7A3E2B'} height={166} width={93} />
  </div>
);
