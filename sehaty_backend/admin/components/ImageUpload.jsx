import React from 'react';
import { Box, Label, DropZone, DropZoneItem } from '@adminjs/design-system';
import { ApiClient } from 'adminjs';

const api = new ApiClient();

const ImageUpload = (props) => {
  const { onChange, property, record } = props;

  const handleDrop = async (files) => {
    if (files && files.length > 0) {
      const formData = new FormData();
      formData.append('image', files[0]);

      try {
        const response = await api.resourceAction({
          resourceId: 'User',
          actionName: 'upload',
          method: 'post',
          data: formData,
        });

        if (response.data.url) {
          onChange('image', response.data.url);
        }
      } catch (error) {
        console.error('Upload error:', error);
      }
    }
  };

  return (
    <Box>
      <Label>{property.label}</Label>
      <DropZone onChange={handleDrop}>
        {record.params.image && (
          <DropZoneItem
            filename={record.params.image}
            onRemove={() => onChange('image', '')}
          />
        )}
      </DropZone>
    </Box>
  );
};

export default ImageUpload; 