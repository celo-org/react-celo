import React, { FunctionComponent, useEffect } from 'react';
import Loader from 'react-loader-spinner';

export const Valora: FunctionComponent<any> = ({
  onSubmit,
}: {
  onSubmit: () => void;
}) => {
  useEffect(() => {
    onSubmit();
  }, []);

  return (
    <div className="tw-flex tw-items-center tw-justify-center">
      <Loader type="TailSpin" color="white" height="36px" width="36px" />
    </div>
  );
};
