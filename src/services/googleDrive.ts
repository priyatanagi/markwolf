import { getAccessToken } from './firebaseAuth';

export interface DriveFileItem {
  id: string;
  name: string;
  modifiedTime: string;
  size?: string;
  webViewLink?: string;
}

export async function checkDriveAuth(): Promise<string> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Please sign in with your Google account to access Google Drive.');
  }
  return token;
}

/**
 * Creates or updates a Markdown document on Google Drive.
 */
export async function saveMarkdownToDrive(
  title: string,
  content: string,
  fileId?: string
): Promise<{ fileId: string; name: string; modifiedTime: string }> {
  const token = await checkDriveAuth();
  const fileName = title.endsWith('.md') ? title : `${title}.md`;

  if (fileId) {
    // Update existing file content
    const res = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'text/markdown; charset=utf-8',
      },
      body: content,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to update Drive file: ${res.statusText}`);
    }

    // Also update filename/metadata if needed
    const metaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: fileName }),
    });

    const metaData = await metaRes.json();
    return {
      fileId: metaData.id,
      name: metaData.name || fileName,
      modifiedTime: metaData.modifiedTime || new Date().toISOString(),
    };
  } else {
    // Create new file with multipart upload
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadata = {
      name: fileName,
      mimeType: 'text/markdown',
    };

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: text/markdown; charset=utf-8\r\n\r\n' +
      content +
      closeDelimiter;

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to create file on Google Drive: ${res.statusText}`);
    }

    const data = await res.json();
    return {
      fileId: data.id,
      name: data.name,
      modifiedTime: data.modifiedTime || new Date().toISOString(),
    };
  }
}

/**
 * Lists Markdown files created or accessible in the user's Drive.
 */
export async function listDriveMarkdownFiles(): Promise<DriveFileItem[]> {
  const token = await checkDriveAuth();
  const query = encodeURIComponent("trashed = false and (mimeType = 'text/markdown' or name contains '.md')");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,size,webViewLink)&orderBy=modifiedTime desc&pageSize=25`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to list files from Google Drive: ${res.statusText}`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Fetches content of a specific file from Google Drive.
 */
export async function fetchDriveFileContent(fileId: string): Promise<string> {
  const token = await checkDriveAuth();
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to read file content: ${res.statusText}`);
  }

  return await res.text();
}

/**
 * Backs up entire workspace (documents, settings) to Google Drive.
 */
export async function backupWorkspaceToDrive(payload: Record<string, any>): Promise<{ fileId: string; name: string }> {
  const token = await checkDriveAuth();
  const fileName = `markdown_editor_workspace_backup_${new Date().toISOString().slice(0, 10)}.json`;
  const content = JSON.stringify(payload, null, 2);

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    description: 'Markdown Editor Cloud Workspace Backup',
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json; charset=utf-8\r\n\r\n' +
    content +
    closeDelimiter;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Backup failed: ${res.statusText}`);
  }

  const data = await res.json();
  return { fileId: data.id, name: data.name };
}

/**
 * Lists workspace backup files on Google Drive.
 */
export async function listDriveBackups(): Promise<DriveFileItem[]> {
  const token = await checkDriveAuth();
  const query = encodeURIComponent("trashed = false and name contains 'markdown_editor_workspace_backup'");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,size)&orderBy=modifiedTime desc&pageSize=10`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to list backups: ${res.statusText}`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Deletes a file from Google Drive (with access token).
 */
export async function deleteDriveFile(fileId: string): Promise<void> {
  const token = await checkDriveAuth();
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to delete Drive file: ${res.statusText}`);
  }
}
