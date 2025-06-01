import { validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  console.log('Validation Request Body:', req.body || {});
  console.log('Validation Request Files:', req.files || {});
  console.log('Validation Request File:', req.file || {});
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation Errors:', errors.array());
    
    // Group errors by field
    const groupedErrors = errors.array().reduce((acc, err) => {
      if (!acc[err.path]) {
        acc[err.path] = [];
      }
      acc[err.path].push(err.msg);
      return acc;
    }, {});

    // Format error messages
    const formattedErrors = Object.entries(groupedErrors).map(([field, messages]) => ({
      field,
      messages,
      value: field === 'image' 
        ? (req.file?.filename || 'No file uploaded')
        : (req.body?.[field] || '')
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
      receivedData: {
        body: req.body || {},
        file: req.file ? {
          fieldname: req.file.fieldname,
          filename: req.file.filename,
          mimetype: req.file.mimetype,
          size: req.file.size
        } : null,
        headers: req.headers
      }
    });
  }
  next();
}; 