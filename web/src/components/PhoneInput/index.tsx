import React from 'react';
import MaskedInput from 'react-text-mask';

const phoneNumberMask = [
  "+",
  "5",
  "5",
  " ",
  "(",
  /\d/,
  /\d/,
  ")",
  " ",
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  /\d/,
  "-",
  /\d/,
  /\d/,
  /\d/,
  /\d/
];

interface Props {
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const PhoneInput: React.FC<Props> = ({handleChange}) => {
  return (
    <MaskedInput
      onChange={handleChange}
      type="text"
      mask={phoneNumberMask}
      name="whatsapp"
      id="whatsapp"
    />
  );
}

export default PhoneInput;
