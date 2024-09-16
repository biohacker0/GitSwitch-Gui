#![cfg_attr(all(not(debug_assertions), target_os = "windows"), windows_subsystem = "windows")]

use rusqlite::{Connection, Result as SqliteResult, params};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::process::Command;
use dirs;
use tauri::Manager;
use std::os::windows::process::CommandExt;



#[derive(Serialize, Deserialize, Debug, Clone)]
struct Account {
    email: String,
    name: String,
    is_active: bool,
}

#[derive(Serialize, Deserialize, Debug)]
struct SSHKey {
    email: String,
    private_key: Vec<u8>,
    public_key: Vec<u8>,
}

fn get_db_path() -> PathBuf {
    let home_dir = dirs::home_dir().unwrap();
    home_dir.join(".git_ledger_gui.db")
}

fn get_ssh_dir() -> PathBuf {
    let home_dir = dirs::home_dir().unwrap();
    home_dir.join(".ssh")
}

fn init_db() -> SqliteResult<()> {
    let conn = Connection::open(get_db_path())?;
    conn.execute(
        "CREATE TABLE IF NOT EXISTS accounts (
            email TEXT PRIMARY KEY,
            name TEXT,
            is_active INTEGER
        )",
        [],
    )?;
    conn.execute(
        "CREATE TABLE IF NOT EXISTS ssh_keys (
            email TEXT PRIMARY KEY,
            private_key BLOB,
            public_key BLOB,
            FOREIGN KEY(email) REFERENCES accounts(email) ON DELETE CASCADE
        )",
        [],
    )?;
    
    Ok(())
}

fn run_git_command(args: &[&str]) -> Result<String, String> {
    let mut command = Command::new("git");
    command.args(args);
    
    #[cfg(target_os = "windows")]
    {
        command.creation_flags(0x08000000); // CREATE_NO_WINDOW flag
    }

    let output = command.output().map_err(|e| e.to_string())?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).trim().to_string())
    }
}


fn generate_ssh_key(email: &str) -> Result<(Vec<u8>, Vec<u8>), String> {
    let ssh_dir = get_ssh_dir();
    fs::create_dir_all(&ssh_dir).map_err(|e| e.to_string())?;

    let private_key_path = ssh_dir.join("id_ed25519");
    let public_key_path = ssh_dir.join("id_ed25519.pub");

    // Remove existing keys
    fs::remove_file(&private_key_path).ok();
    fs::remove_file(&public_key_path).ok();

    let mut command = Command::new("ssh-keygen");
    command.args(&["-t", "ed25519", "-f", private_key_path.to_str().unwrap(), "-N", "", "-C", email]);

    #[cfg(target_os = "windows")]
    {
        command.creation_flags(0x08000000); // CREATE_NO_WINDOW
    }

    command.stdout(std::process::Stdio::null())
        .stderr(std::process::Stdio::null())
        .output()
        .map_err(|e| e.to_string())?;

    let private_key = fs::read(&private_key_path).map_err(|e| e.to_string())?;
    let public_key = fs::read(&public_key_path).map_err(|e| e.to_string())?;

    Ok((private_key, public_key))
}

fn set_active_ssh_key(email: &str) -> Result<(), String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    let (private_key, public_key): (Vec<u8>, Vec<u8>) = conn.query_row(
        "SELECT private_key, public_key FROM ssh_keys WHERE email = ?",
        params![email],
        |row| Ok((row.get(0)?, row.get(1)?))
    ).map_err(|e| e.to_string())?;

    let ssh_dir = get_ssh_dir();
    fs::write(ssh_dir.join("id_ed25519"), private_key).map_err(|e| e.to_string())?;
    fs::write(ssh_dir.join("id_ed25519.pub"), public_key).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn get_current_user() -> Result<Account, String> {
    let name = run_git_command(&["config", "--global", "user.name"])?;
    let email = run_git_command(&["config", "--global", "user.email"])?;

    if name.is_empty() || email.is_empty() {
        return Err("No current user found".to_string());
    }

    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    let is_active: bool = conn.query_row(
        "SELECT is_active FROM accounts WHERE email = ?",
        params![&email],
        |row| row.get(0)
    ).unwrap_or(false);

    Ok(Account {
        name,
        email,
        is_active,
    })
}

#[tauri::command]
fn list_accounts() -> Result<Vec<Account>, String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT name, email, is_active FROM accounts")
        .map_err(|e| e.to_string())?;
    let accounts = stmt
        .query_map([], |row| {
            Ok(Account {
                name: row.get(0)?,
                email: row.get(1)?,
                is_active: row.get::<_, i32>(2)? == 1,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    Ok(accounts)
}

#[tauri::command]
fn add_account(name: String, email: String) -> Result<String, String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;

    // Deactivate all other accounts
    conn.execute("UPDATE accounts SET is_active = 0", []).map_err(|e| e.to_string())?;

    // Insert the new account and set it as active
    conn.execute(
        "INSERT OR REPLACE INTO accounts (email, name, is_active) VALUES (?, ?, 1)",
        params![&email, &name],
    ).map_err(|e| e.to_string())?;

    // Generate new SSH keys
    let (private_key, public_key) = generate_ssh_key(&email)?;

    // Store SSH keys in the database
    conn.execute(
        "INSERT OR REPLACE INTO ssh_keys (email, private_key, public_key) VALUES (?, ?, ?)",
        params![&email, &private_key, &public_key],
    ).map_err(|e| e.to_string())?;

    // Set Git global config
    run_git_command(&["config", "--global", "user.name", &name])?;
    run_git_command(&["config", "--global", "user.email", &email])?;

    Ok(String::from_utf8(public_key).map_err(|e| e.to_string())?)
}

#[tauri::command]
async fn remove_account(email: String, window: tauri::Window) -> Result<(), String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;

    // Check if the account to be removed is active
    let is_active: bool = conn.query_row(
        "SELECT is_active FROM accounts WHERE email = ?",
        params![&email],
        |row| row.get(0)
    ).unwrap_or(false);

    // Delete the account and its SSH keys
    conn.execute("DELETE FROM accounts WHERE email = ?", params![&email])
        .map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM ssh_keys WHERE email = ?", params![&email])
        .map_err(|e| e.to_string())?;

    // If the removed account was active, clear Git credentials and SSH keys
    if is_active {
        run_git_command(&["config", "--global", "--unset", "user.name"])?;
        run_git_command(&["config", "--global", "--unset", "user.email"])?;
        
        let ssh_dir = get_ssh_dir();
        fs::remove_file(ssh_dir.join("id_ed25519")).ok();
        fs::remove_file(ssh_dir.join("id_ed25519.pub")).ok();
    }

    // Emit an event to update the UI
    window.emit("account-removed", email).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn switch_account(email: String) -> Result<(), String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;

    // Deactivate all accounts
    conn.execute("UPDATE accounts SET is_active = 0", []).map_err(|e| e.to_string())?;

    // Activate the selected account
    conn.execute(
        "UPDATE accounts SET is_active = 1 WHERE email = ?",
        params![&email]
    ).map_err(|e| e.to_string())?;

    // Fetch account details
    let name: String = conn.query_row(
        "SELECT name FROM accounts WHERE email = ?",
        params![&email],
        |row| row.get(0)
    ).map_err(|e| e.to_string())?;

    // Set the active SSH key
    set_active_ssh_key(&email)?;

    // Update Git global config
    run_git_command(&["config", "--global", "user.name", &name])?;
    run_git_command(&["config", "--global", "user.email", &email])?;

    Ok(())
}

#[tauri::command]
fn get_ssh_key(email: String) -> Result<String, String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    let public_key: Vec<u8> = conn.query_row(
        "SELECT public_key FROM ssh_keys WHERE email = ?",
        params![&email],
        |row| row.get(0)
    ).map_err(|e| e.to_string())?;
    
    String::from_utf8(public_key).map_err(|e| e.to_string())
}

#[tauri::command]
async fn remove_all_accounts(window: tauri::Window) -> Result<(), String> {
    let conn = Connection::open(get_db_path()).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM accounts", []).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM ssh_keys", []).map_err(|e| e.to_string())?;

    let ssh_dir = get_ssh_dir();
    fs::remove_file(ssh_dir.join("id_ed25519")).ok();
    fs::remove_file(ssh_dir.join("id_ed25519.pub")).ok();

    run_git_command(&["config", "--global", "--unset", "user.name"])?;
    run_git_command(&["config", "--global", "--unset", "user.email"])?;

    // Emit an event to update the UI
    window.emit("all-accounts-removed", ()).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn clear_current_user() -> Result<(), String> {
    run_git_command(&["config", "--global", "--unset", "user.name"])?;
    run_git_command(&["config", "--global", "--unset", "user.email"])?;
    Ok(())
}

fn main() {
    init_db().expect("Failed to initialize database");
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_current_user,
            list_accounts,
            add_account,
            remove_account,
            switch_account,
            get_ssh_key,
            remove_all_accounts,
            clear_current_user
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}