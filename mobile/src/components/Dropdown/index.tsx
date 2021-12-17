import React from 'react';
import { Picker } from '@react-native-picker/picker';

interface Props {
  selected: string;
  items: string[];
  onChange: (value: string) => void;
}

const Dropdown:React.FC<Props> = ({selected, items, onChange}) => {
  return (
    <Picker
      selectedValue={selected}
      onValueChange={(value) => onChange(value as string)}
    >
      {items.map(item => (
        <Picker.Item label={item} value={item} key={item} />
      ))}
    </Picker>
  )
}

export default Dropdown;
