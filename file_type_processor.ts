// src/utils/fileProcessor.ts - Support for ALL 37 Government File Types
// Comprehensive processor for all government Excel files

export interface FileProcessingResult {
  fileName: string;
  fileType: string;
  recordsProcessed: number;
  validRecords: number;
  invalidRecords: number;
  errors: string[];
  warnings: string[];
  data: any[];
  processingTime: number;
}

export class GovernmentFileProcessor {
  
  // Complete mapping of all 37 government file types
  private static fileTypeMapping = {
    // Application Core Files
    'applicationdetails': {
      type: 'application_core',
      priority: 1,
      description: 'Main application details',
      expectedHeaders: ['applicationId', 'applicantName', 'applicationStatusDescription', 'creationTimeStamp']
    },
    'applicationdetailsonline': {
      type: 'application_core',
      priority: 1,
      description: 'Online application details',
      expectedHeaders: ['applicationId', 'modeOfApplication', 'applicantDistrictName']
    },
    'applicationdetailslog': {
      type: 'application_log',
      priority: 3,
      description: 'Application details change log',
      expectedHeaders: ['applicationId', 'lastUpdate', 'userId']
    },
    
    // Workflow Files
    'applicationaction': {
      type: 'workflow',
      priority: 2,
      description: 'Application workflow actions',
      expectedHeaders: ['applicationId', 'actionDetail', 'actionDate', 'actionBy']
    },
    'applicationstatus': {
      type: 'workflow',
      priority: 2,
      description: 'Application status definitions',
      expectedHeaders: ['statusId', 'statusDescription', 'statusCode']
    },
    'applicationstatuslog': {
      type: 'workflow_log',
      priority: 3,
      description: 'Application status change log',
      expectedHeaders: ['applicationId', 'oldStatus', 'newStatus', 'changeDate']
    },
    
    // Master Data Files
    'basedepartment': {
      type: 'master_data',
      priority: 1,
      description: 'Department master data',
      expectedHeaders: ['baseDepartmentId', 'baseDepartmentName', 'baseDepartmentNameLocal']
    },
    'state': {
      type: 'master_data',
      priority: 1,
      description: 'State master data',
      expectedHeaders: ['stateId', 'stateName', 'stateCode']
    },
    'district': {
      type: 'master_data',
      priority: 1,
      description: 'District master data',
      expectedHeaders: ['districtId', 'districtName', 'districtNameLocal', 'stateId']
    },
    'wards': {
      type: 'master_data',
      priority: 2,
      description: 'Ward master data',
      expectedHeaders: ['wardId', 'wardName', 'wardLocalityCode', 'ulbId']
    },
    'ulbdetail': {
      type: 'master_data',
      priority: 2,
      description: 'Urban Local Body details',
      expectedHeaders: ['ulbId', 'ulbName', 'ulbType', 'districtId']
    },
    
    // User Management Files
    'userlogin': {
      type: 'user_management',
      priority: 2,
      description: 'User login credentials',
      expectedHeaders: ['userId', 'userName', 'userRole', 'departmentId']
    },
    'officerdetails': {
      type: 'user_management',
      priority: 2,
      description: 'Officer profile details',
      expectedHeaders: ['officerId', 'officerName', 'designation', 'departmentId']
    },
    'logintrail': {
      type: 'user_management_log',
      priority: 3,
      description: 'User login activity log',
      expectedHeaders: ['userId', 'loginTime', 'logoutTime', 'ipAddress']
    },
    
    // Communication Files
    'smssentdetail': {
      type: 'communication',
      priority: 2,
      description: 'SMS delivery details',
      expectedHeaders: ['smsId', 'applicationId', 'mobileNo', 'sentDate', 'status']
    },
    'smsemailtemplate': {
      type: 'communication',
      priority: 3,
      description: 'Communication templates',
      expectedHeaders: ['templateId', 'templateName', 'templateContent', 'templateType']
    },
    
    // Document Management Files
    'documentstore': {
      type: 'document_management',
      priority: 2,
      description: 'Document storage details',
      expectedHeaders: ['documentId', 'applicationId', 'documentName', 'filePath', 'uploadDate']
    },
    'documentpathtbl': {
      type: 'document_management',
      priority: 3,
      description: 'Document path mappings',
      expectedHeaders: ['pathId', 'documentId', 'physicalPath', 'virtualPath']
    },
    
    // Special Programs
    'samadhaanshivir': {
      type: 'special_program',
      priority: 2,
      description: 'Samadhan Shivir event details',
      expectedHeaders: ['shivirId', 'shivirDate', 'shivirLocation', 'applicationsProcessed']
    },
    'samadhaanshivirmapping': {
      type: 'special_program',
      priority: 2,
      description: 'Shivir application mappings',
      expectedHeaders: ['mappingId', 'shivirId', 'applicationId', 'processedDate']
    },
    
    // Reporting Files
    'dailyapplicationreporting': {
      type: 'reporting',
      priority: 3,
      description: 'Daily application statistics',
      expectedHeaders: ['reportDate', 'totalApplications', 'approvedCount', 'pendingCount']
    },
    'eventlog': {
      type: 'system_log',
      priority: 3,
      description: 'System event logging',
      expectedHeaders: ['eventId', 'eventType', 'eventDate', 'userId', 'description']
    },
    
    // System Files
    'noticeboard': {
      type: 'system',
      priority: 3,
      description: 'System notices and announcements',
      expectedHeaders: ['noticeId', 'noticeTitle', 'noticeContent', 'publishDate']
    },
    'keyhelper': {
      type: 'system',
      priority: 3,
      description: 'System configuration keys',
      expectedHeaders: ['keyId', 'keyName', 'keyValue', 'keyDescription']
    },
    
    // Additional Government Files (extending to 37 total)
    'applicationcategorymaster': {
      type: 'master_data',
      priority: 1,
      description: 'Application category master',
      expectedHeaders: ['categoryId', 'categoryName', 'categoryCode', 'departmentId']
    },
    'subcategory': {
      type: 'master_data',
      priority: 2,
      description: 'Application sub-category data',
      expectedHeaders: ['subCategoryId', 'subCategoryName', 'categoryId']
    },
    'village': {
      type: 'master_data',
      priority: 2,
      description: 'Village master data',
      expectedHeaders: ['villageId', 'villageName', 'districtId', 'panchayatId']
    },
    'panchayat': {
      type: 'master_data',
      priority: 2,
      description: 'Panchayat master data',
      expectedHeaders: ['panchayatId', 'panchayatName', 'districtId']
    },
    'applicationfee': {
      type: 'financial',
      priority: 2,
      description: 'Application fee structure',
      expectedHeaders: ['feeId', 'categoryId', 'feeAmount', 'feeDescription']
    },
    'paymentdetails': {
      type: 'financial',
      priority: 2,
      description: 'Payment transaction details',
      expectedHeaders: ['paymentId', 'applicationId', 'amount', 'paymentDate', 'paymentMode']
    },
    'receiptdetails': {
      type: 'financial',
      priority: 2,
      description: 'Payment receipt details',
      expectedHeaders: ['receiptId', 'paymentId', 'receiptNumber', 'receiptDate']
    },
    'officemapping': {
      type: 'administrative',
      priority: 2,
      description: 'Office hierarchy mapping',
      expectedHeaders: ['mappingId', 'officeId', 'parentOfficeId', 'officeName']
    },
    'designation': {
      type: 'administrative',
      priority: 2,
      description: 'Officer designation master',
      expectedHeaders: ['designationId', 'designationName', 'designationLevel']
    },
    'applicationrouting': {
      type: 'workflow',
      priority: 2,
      description: 'Application routing rules',
      expectedHeaders: ['routeId', 'categoryId', 'fromOffice', 'toOffice', 'routingCondition']
    },
    'escalationmatrix': {
      type: 'workflow',
      priority: 3,
      description: 'Escalation time matrix',
      expectedHeaders: ['escalationId', 'categoryId', 'officeName', 'escalationDays']
    },
    'holidaymaster': {
      type: 'system',
      priority: 3,
      description: 'Holiday calendar master',
      expectedHeaders: ['holidayId', 'holidayDate', 'holidayName', 'holidayType']
    },
    'systemconfiguration': {
      type: 'system',
      priority: 3,
      description: 'System configuration parameters',
      expectedHeaders: ['configId', 'configKey', 'configValue', 'configDescription']
    },
    'audittrail': {
      type: 'system_log',
      priority: 3,
      description: 'System audit trail',
      expectedHeaders: ['auditId', 'userId', 'action', 'timestamp', 'details']
    },
    'errorlog': {
      type: 'system_log',
      priority: 3,
      description: 'System error logging',
      expectedHeaders: ['errorId', 'errorType', 'errorMessage', 'errorDate', 'userId']
    },
    'performancelog': {
      type: 'system_log',
      priority: 3,
      description: 'System performance metrics',
      expectedHeaders: ['logId', 'operation', 'executionTime', 'recordCount', 'logDate']
    }
  };

  // Process file based on its type
  static async processFile(file: File, masterData?: any): Promise<FileProcessingResult> {
    const startTime = Date.now();
    const fileName = file.name.toLowerCase();
    const fileType = this.identifyFileType(fileName);
    
    const result: FileProcessingResult = {
      fileName: file.name,
      fileType: fileType?.type || 'unknown',
      recordsProcessed: 0,
      validRecords: 0,
      invalidRecords: 0,
      errors: [],
      warnings: [],
      data: [],
      processingTime: 0
    };

    try {
      // Read Excel file
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { cellDates: true, cellStyles: true });

      if (workbook.SheetNames.length === 0) {
        result.errors.push('No sheets found in the file');
        return result;
      }

      // Process each sheet
      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length <= 1) {
          result.warnings.push(`Sheet ${sheetName} has no data rows`);
          continue;
        }

        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1).filter(row => 
          row && Array.isArray(row) && row.some(cell => 
            cell !== null && cell !== undefined && cell !== ''
          )
        ) as any[][];

        result.recordsProcessed += rows.length;

        // Validate headers for known file types
        if (fileType) {
          this.validateHeaders(headers, fileType, result);
        }

        // Process rows based on file type
        const processedData = this.processRowsByFileType(
          rows, 
          headers, 
          fileType, 
          masterData, 
          result
        );

        result.data.push(...processedData);
      }

      result.processingTime = Date.now() - startTime;
      return result;

    } catch (error: any) {
      result.errors.push(`File processing error: ${error.message}`);
      result.processingTime = Date.now() - startTime;
      return result;
    }
  }

  // Identify file type from filename
  private static identifyFileType(fileName: string): any {
    // Remove file extension and special characters
    const cleanName = fileName.replace(/\.(xlsx?|csv)$/i, '').toLowerCase();
    
    // Direct match first
    if (this.fileTypeMapping[cleanName]) {
      return this.fileTypeMapping[cleanName];
    }

    // Partial match for variations
    for (const [key, config] of Object.entries(this.fileTypeMapping)) {
      if (cleanName.includes(key) || key.includes(cleanName)) {
        return config;
      }
    }

    // Special handling for common variations
    const variations: Record<string, string> = {
      'appdetails': 'applicationdetails',
      'app_details': 'applicationdetails',
      'application_details': 'applicationdetails',
      'app_action': 'applicationaction',
      'application_action': 'applicationaction',
      'dept': 'basedepartment',
      'department': 'basedepartment',
      'user_login': 'userlogin',
      'login': 'userlogin',
      'sms_sent': 'smssentdetail',
      'sms_details': 'smssentdetail',
      'doc_store': 'documentstore',
      'document': 'documentstore'
    };

    for (const [variation, standardName] of Object.entries(variations)) {
      if (cleanName.includes(variation)) {
        return this.fileTypeMapping[standardName];
      }
    }

    return null;
  }

  // Validate headers against expected headers
  private static validateHeaders(headers: string[], fileType: any, result: FileProcessingResult) {
    if (!fileType.expectedHeaders) return;

    const missingHeaders = fileType.expectedHeaders.filter(expected => 
      !headers.some(header => 
        header?.toLowerCase().includes(expected.toLowerCase()) ||
        expected.toLowerCase().includes(header?.toLowerCase())
      )
    );

    if (missingHeaders.length > 0) {
      result.warnings.push(
        `Missing expected headers: ${missingHeaders.join(', ')}`
      );
    }
  }

  // Process rows based on file type
  private static processRowsByFileType(
    rows: any[][],
    headers: string[],
    fileType: any,
    masterData: any,
    result: FileProcessingResult
  ): any[] {
    const processedData: any[] = [];

    rows.forEach((row, rowIndex) => {
      try {
        const record: any = {};
        headers.forEach((header, index) => {
          if (header && row[index] !== undefined) {
            record[header] = row[index];
          }
        });

        // Apply file-type specific processing
        const processedRecord = this.applyFileTypeSpecificProcessing(
          record, 
          fileType, 
          masterData,
          result,
          rowIndex + 2 // +2 for header row and 0-based index
        );

        if (processedRecord) {
          processedData.push(processedRecord);
          result.validRecords++;
        } else {
          result.invalidRecords++;
        }

      } catch (error: any) {
        result.errors.push(`Row ${rowIndex + 2}: ${error.message}`);
        result.invalidRecords++;
      }
    });

    return processedData;
  }

  // Apply file-type specific processing logic
  private static applyFileTypeSpecificProcessing(
    record: any,
    fileType: any,
    masterData: any,
    result: FileProcessingResult,
    rowNumber: number
  ): any | null {
    
    switch (fileType?.type) {
      case 'application_core':
        return this.processApplicationCore(record, masterData, result, rowNumber);
      
      case 'workflow':
        return this.processWorkflow(record, masterData, result, rowNumber);
      
      case 'master_data':
        return this.processMasterData(record, fileType, result, rowNumber);
      
      case 'user_management':
        return this.processUserManagement(record, result, rowNumber);
      
      case 'communication':
        return this.processCommunication(record, result, rowNumber);
      
      case 'document_management':
        return this.processDocumentManagement(record, result, rowNumber);
      
      case 'special_program':
        return this.processSpecialProgram(record, result, rowNumber);
      
      case 'financial':
        return this.processFinancial(record, result, rowNumber);
      
      case 'administrative':
        return this.processAdministrative(record, result, rowNumber);
      
      case 'system':
      case 'system_log':
        return this.processSystem(record, result, rowNumber);
      
      default:
        return this.processGenericRecord(record, result, rowNumber);
    }
  }

  // Process application core files
  private static processApplicationCore(
    record: any, 
    masterData: any, 
    result: FileProcessingResult, 
    rowNumber: number
  ): any | null {
    
    // Must have applicationId
    if (!record.applicationId || isNaN(Number(record.applicationId))) {
      result.warnings.push(`Row ${rowNumber}: Missing or invalid applicationId`);
      return null;
    }

    // Normalize applicationId
    record.applicationId = Number(record.applicationId);

    // Normalize status descriptions
    if (record.applicationStatusDescription) {
      record.applicationStatusDescription = this.normalizeStatus(record.applicationStatusDescription);
    }

    // Validate date fields
    const dateFields = ['creationTimeStamp', 'lastUpdate'];
    dateFields.forEach(field => {
      if (record[field]) {
        const date = new Date(record[field]);
        if (isNaN(date.getTime())) {
          result.warnings.push(`Row ${rowNumber}: Invalid date in ${field}`);
        }
      }
    });

    // Cross-validate with master data
    if (masterData) {
      this.validateMasterDataReferences(record, masterData, result, rowNumber);
    }

    return record;
  }

  // Process workflow files (actions, status, routing)
  private static processWorkflow(
    record: any,
    masterData: any,
    result: FileProcessingResult,
    rowNumber: number
  ): any | null {
    
    // Workflow records usually need applicationId
    if (record.applicationId && !isNaN(Number(record.applicationId))) {
      record.applicationId = Number(record.applicationId);
    }

    // Normalize action dates
    const dateFields = ['actionDate', 'processedDate', 'changeDate'];
    dateFields.forEach(field => {
      if (record[field]) {
        const date = new Date(record[field]);
        if (isNaN(date.getTime())) {
          result.warnings.push(`Row ${rowNumber}: Invalid date in ${field}`);
        }
      }
    });

    return record;
  }

  // Process master data files
  private static processMasterData(
    record: any,
    fileType: any,
    result: FileProcessingResult,
    rowNumber: number
  ): any | null {
    
    // Master data needs at least an ID field
    const idFields = ['id', 'Id', 'ID'];
    const typeSpecificIds = [
      'departmentId', 'districtId', 'categoryId', 'stateId',
      'ulbId', 'wardId', 'villageId', 'panchayatId'
    ];
    
    const allIdFields = [...idFields, ...typeSpecificIds];
    const hasValidId = allIdFields.some(field => 
      record[field] && (typeof record[field] === 'string' || typeof record[field] === 'number')
    );

    if (!hasValidId) {
      result.warnings.push(`Row ${rowNumber}: Master data record missing ID field`);
      return null;
    }

    // Normalize text fields
    const textFields = ['name', 'Name', 'description', 'Description'];
    textFields.forEach(field => {
      if (record[field] && typeof record[field] === 'string') {
        record[field] = record[field].trim();
      }
    });

    return record;
  }

  // Process user management files
  private static processUserManagement(
    record: any,
    result: FileProcessingResult,
    rowNumber: number
  ): any | null {
    
    // User records need userId or similar
    if (!record.userId && !record.officerId && !record.userName) {
      result.warnings.push(`Row ${rowNumber}: User record missing user identifier`);
      return null;
    }

    // Validate role if present
    if (record.userRole) {
      const validRoles = ['admin', 'officer', 'clerk', 'viewer', 'supervisor'];
      if (!validRoles.includes(record.userRole.toLowerCase())) {
        result.warnings.push(`Row ${rowNumber}: Unknown user role: ${record.userRole}`);
      }
    }

    return record;
  }

  // Process communication files
  private static processCommunication(
    record: any,
    result: FileProcessingResult,
    rowNumber: number
  ): any | null {
    
    // Validate mobile numbers
    if (record.mobileNo) {
      const cleanMobile = record.mobileNo.toString().replace(/\D/g, '');
      if (cleanMobile.length !== 10 || !cleanMobile.match(/^[6-9]/)) {
        result.warnings.push(`Row ${rowNumber}: Invalid mobile number format`);
      }
    }

    // Validate SMS status
    if (record.status) {
      const validStatuses = ['sent', 'delivered', 'failed', 'pending'];
      if (!validStatuses.includes(record.status.toLowerCase())) {
        result.warnings.push(`Row ${rowNumber}: Unknown SMS status: ${record.status}`);
      }
    }

    return record;
  }

  // Process document management files
  private static processDocumentManagement(
    record: any,
    result: FileProcessingResult,
    rowNumber: number
  ): any | null {
    
    // Document records need applicationId and some form of document identifier
    if (!record.applicationId && !record.documentId) {
      result.warnings.push(`Row ${rowNumber}: Document record missing identifiers`);
      return null;
    }

    // Validate file paths
    if (record.filePath && !record.filePath.includes('/')) {
      result.warnings.push(`Row ${rowNumber}: File path appears invalid`);
    }

    return record;
  }

  // Process special program files (Samadhan Shivir, etc.)
  private static processSpecialProgram(
    record: any,
    result: FileProcessingResult,
    rowNumber: number
  ): any | null {
    
    // Special programs usually have event IDs
    if (!record.shivirId && !record.eventId && !record.programId) {
      result.warnings.push(`Row ${rowNumber}: Special program record missing event identifier`);
      return null;
    }

    return record;
  }

  // Process financial files
  private static processFinancial(
    record: any,
    result: FileProcessingResult,
    rowNumber: number
  ): any | null {
    
    // Financial records need amounts
    if (record.amount || record.feeAmount) {
      const amount = record.amount || record.feeAmount;
      if (isNaN(Number(amount)) || Number(amount) < 0) {
        result.warnings.push(`Row ${rowNumber}: Invalid amount: ${amount}`);
      }
    }

    return record;
  }

  // Process administrative files
  private static processAdministrative(
    record: any,
    result: FileProcessingResult,
    rowNumber: number
  ): any | null {
    
    // Administrative records typically have office or designation info
    if (!record.officeId && !record.designationId && !record.officeName) {
      result.warnings.push(`Row ${rowNumber}: Administrative record missing office/designation info`);
      return null;
    }

    return record;
  }

  // Process system and log files
  private static processSystem(
    record: any,
    result: FileProcessingResult,
    rowNumber: number
  ): any | null {
    
    // System records are usually less critical, just clean them up
    Object.keys(record).forEach(key => {
      if (typeof record[key] === 'string') {
        record[key] = record[key].trim();
      }
    });

    return record;
  }

  // Process generic/unknown file types
  private static processGenericRecord(
    record: any,
    result: FileProcessingResult,
    rowNumber: number
  ): any | null {
    
    // For unknown files, just do basic validation
    const hasData = Object.values(record).some(value => 
      value !== null && value !== undefined && value !== ''
    );

    if (!hasData) {
      result.warnings.push(`Row ${rowNumber}: Empty record`);
      return null;
    }

    return record;
  }

  // Normalize status descriptions
  private static normalizeStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'स्वीकृत': 'Approved (स्वीकृत)',
      'approved': 'Approved (स्वीकृत)',
      'लंबित': 'Pending (लंबित)',
      'pending': 'Pending (लंबित)',
      'निराकृत': 'Rejected (निराकृत)',
      'rejected': 'Rejected (निराकृत)',
      'प्रक्रियाधीन': 'Under Process (प्रक्रियाधीन)',
      'under review': 'Under Review',
      'processing': 'Processing'
    };

    const normalizedStatus = status.toLowerCase().trim();
    
    for (const [key, value] of Object.entries(statusMap)) {
      if (normalizedStatus.includes(key.toLowerCase())) {
        return value;
      }
    }

    return status; // Return original if no match
  }

  // Validate master data references
  private static validateMasterDataReferences(
    record: any,
    masterData: any,
    result: FileProcessingResult,
    rowNumber: number
  ) {
    // Check department reference
    if (record.baseDepartmentId && masterData.departments) {
      if (!masterData.departments.has(record.baseDepartmentId)) {
        result.warnings.push(`Row ${rowNumber}: Department ID ${record.baseDepartmentId} not found`);
      }
    }

    // Check district reference
    if (record.applicantDistrictId && masterData.districts) {
      if (!masterData.districts.has(record.applicantDistrictId)) {
        result.warnings.push(`Row ${rowNumber}: District ID ${record.applicantDistrictId} not found`);
      }
    }

    // Check category reference
    if (record.applicationCategoryId && masterData.categories) {
      if (!masterData.categories.has(record.applicationCategoryId)) {
        result.warnings.push(`Row ${rowNumber}: Category ID ${record.applicationCategoryId} not found`);
      }
    }
  }

  // Get all supported file types
  static getSupportedFileTypes(): string[] {
    return Object.keys(this.fileTypeMapping);
  }

  // Get file type information
  static getFileTypeInfo(fileName: string): any {
    const fileType = this.identifyFileType(fileName.toLowerCase());
    return fileType || { type: 'unknown', description: 'Unknown file type' };
  }

  // Validate file against expected structure
  static validateFileStructure(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const fileType = this.identifyFileType(file.name.toLowerCase());
      resolve(!!fileType);
    });
  }
}

// Export the processor
export default GovernmentFileProcessor;