// config/multerStorageManager.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

class MulterStorageManager {
  constructor() {
    this.baseUploadPath = path.join(__dirname, "../public/uploads");
    this.configurations = {};
    this.initializeDefaultConfigurations();
  }

  initializeDefaultConfigurations() {
    // Subject Group Photos
    this.registerStorage("subjectGroupPhotos", {
      subPath: "subject_groups/subject_group_photos",
      filenameGenerator: (req, file) => {
        const ext = path.extname(file.originalname);
        return req.params.id
          ? `subj_group_${req.params.id}${ext}`
          : `temp_${Date.now()}${ext}`;
      },
      allowedMimeTypes: ["image/jpeg", "image/png", "image/gif"],
    });

    // Group Photos
    this.registerStorage("groupPhotos", {
      subPath: "group/group_photos",
      filenameGenerator: (req, file) => {
        const ext = path.extname(file.originalname);
        return req.params.id
          ? `group_${req.params.id}${ext}`
          : `temp_group_${Date.now()}${ext}`;
      },
      allowedMimeTypes: ["image/jpeg", "image/png", "image/gif"],
    });

    // Subject Material Files
    this.registerStorage("subjectMaterialFiles", {
      subPath: "subjects/material_files",
      filenameGenerator: (req, file) => {
        const ext = path.extname(file.originalname);
        return `material_${Date.now()}${ext}`;
      },
      allowedMimeTypes: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
    });

    // Subject Icons
    this.registerStorage("subjectIcons", {
      subPath: "subjects/subject_icons",
      filenameGenerator: (req, file) => {
        const ext = path.extname(file.originalname);
        return `icon_${req.params.id || Date.now()}${ext}`;
      },
      allowedMimeTypes: ["image/jpeg", "image/png"],
    });

    // User Profile Photos
    this.registerStorage("userProfilePhotos", {
      subPath: "users/profile_data",
      filenameGenerator: (req, file) => {
        const ext = path.extname(file.originalname);
        return `profile_${req.user.id}${ext}`;
      },
      allowedMimeTypes: ["image/jpeg", "image/png"],
    });
  }

  /**
   * Register a new storage configuration
   * @param {string} name - Unique identifier for the storage
   * @param {object} config - Configuration object
   * @param {string} config.subPath - Relative path from base upload directory
   * @param {function} [config.filenameGenerator] - Custom filename generator
   * @param {array} [config.allowedMimeTypes] - Allowed file types
   * @param {object} [config.limits] - Multer limits configuration
   */
  registerStorage(name, config) {
    const fullPath = path.join(this.baseUploadPath, config.subPath);

    // Ensure directory exists
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }

    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, fullPath);
      },
      filename: (req, file, cb) => {
        let filename;
        if (config.filenameGenerator) {
          filename = config.filenameGenerator(req, file);
        } else {
          const ext = path.extname(file.originalname);
          filename = `${file.fieldname}_${Date.now()}${ext}`;
        }
        cb(null, filename);
      },
    });

    this.configurations[name] = {
      upload: multer({
        storage,
        fileFilter: config.allowedMimeTypes
          ? (req, file, cb) => {
              if (config.allowedMimeTypes.includes(file.mimetype)) {
                cb(null, true);
              } else {
                cb(
                  new Error(
                    `Invalid file type. Allowed types: ${config.allowedMimeTypes.join(
                      ", "
                    )}`
                  ),
                  false
                );
              }
            }
          : undefined,
        limits: config.limits,
      }),
      config,
    };
  }

  /**
   * Get a configured multer instance
   * @param {string} name - Name of the storage configuration
   * @returns {object} Multer instance
   */
  getUpload(name) {
    if (!this.configurations[name]) {
      throw new Error(`Storage configuration "${name}" not found`);
    }
    return this.configurations[name].upload;
  }

  /**
   * Delete a file from storage
   * @param {string} configName - Name of the storage configuration
   * @param {string} filename - Name of the file to delete
   * @returns {boolean} True if file was deleted, false if not found
   */
  deleteFile(configName, filename) {
    if (!this.configurations[configName]) {
      throw new Error(`Storage configuration "${configName}" not found`);
    }

    const filePath = path.join(
      this.baseUploadPath,
      this.configurations[configName].config.subPath,
      filename
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }

  /**
   * Get the full path to a stored file
   * @param {string} configName - Name of the storage configuration
   * @param {string} filename - Name of the file
   * @returns {string} Full filesystem path
   */
  getFilePath(configName, filename) {
    if (!this.configurations[configName]) {
      throw new Error(`Storage configuration "${configName}" not found`);
    }
    return path.join(
      this.baseUploadPath,
      this.configurations[configName].config.subPath,
      filename
    );
  }

  /**
   * Renames a file within the same storage configuration
   * @param {string} configName - Storage configuration name
   * @param {string} oldFilename - Current filename
   * @param {string} newFilename - New filename
   * @returns {boolean} True if rename was successful
   */
  renameFile(configName, oldFilename, newFilename) {
    if (!this.configurations[configName]) {
      throw new Error(`Storage configuration "${configName}" not found`);
    }

    const oldPath = this.getFilePath(configName, oldFilename);
    const newPath = this.getFilePath(configName, newFilename);

    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
      return true;
    }
    return false;
  }

  /**
   * Extracts just the filename from a path
   * @param {string} filePath - Full path or filename
   * @returns {string} Just the filename with extension
   */
  getFilenameFromPath(filePath) {
    return path.basename(filePath);
  }

  /**
   * Changes a file's extension
   * @param {string} filename - Original filename
   * @param {string} newExtension - New extension (with dot, e.g. '.jpg')
   * @returns {string} Filename with new extension
   */
  changeFileExtension(filename, newExtension) {
    const ext = path.extname(filename);
    return filename.replace(new RegExp(`${ext}$`), newExtension);
  }

  /**
   * Get the public URL for a stored file
   * @param {string} configName - Name of the storage configuration
   * @param {string} filename - Name of the file
   * @returns {string} Public URL path
   */
  getPublicUrl(configName, filename) {
    if (!filename) return null;
    if (!this.configurations[configName]) {
      throw new Error(`Storage configuration "${configName}" not found`);
    }
    return `/uploads/${this.configurations[configName].config.subPath}/${filename}`;
  }
}

module.exports = new MulterStorageManager();
