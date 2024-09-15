import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Button,
  Tabs,
  Input,
  Form,
  List,
  Card,
  Modal,
  message,
  Switch,
  Typography,
  Space,
  Tooltip,
  Tag,
  ConfigProvider,
  theme,
} from "antd";
import {
  UserOutlined,
  UserAddOutlined,
  SwapOutlined,
  UserDeleteOutlined,
  KeyOutlined,
  DeleteOutlined,
  LogoutOutlined,
  CopyOutlined,
  BulbOutlined,
  BulbFilled,
  BlockOutlined,
} from "@ant-design/icons";
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/api/shell";

const { Header, Sider, Content } = Layout;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

function App() {
  const [currentTab, setCurrentTab] = useState("list");
  const [accounts, setAccounts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [newAccountSSHKey, setNewAccountSSHKey] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetchData();

    const removeAccountListener = listen("account-removed", (event) => {
      const removedEmail = event.payload;
      setAccounts((prevAccounts) =>
        prevAccounts.filter((account) => account.email !== removedEmail)
      );
      if (currentUser && currentUser.email === removedEmail) {
        setCurrentUser(null);
      }
    });

    const removeAllAccountsListener = listen("all-accounts-removed", () => {
      setAccounts([]);
      setCurrentUser(null);
    });

    return () => {
      removeAccountListener.then((unlisten) => unlisten());
      removeAllAccountsListener.then((unlisten) => unlisten());
    };
  }, []);

  const fetchData = async () => {
    try {
      const [fetchedAccounts, user] = await Promise.all([
        invoke("list_accounts"),
        invoke("get_current_user"),
      ]);
      setAccounts(fetchedAccounts);
      setCurrentUser(user);
    } catch (error) {
      message.error("Failed to fetch data: " + error);
    }
  };

  const handleAddAccount = async (values) => {
    try {
      const publicKey = await invoke("add_account", {
        name: values.name,
        email: values.email,
      });
      message.success("Account added successfully");
      setNewAccountSSHKey(publicKey);
      fetchData();
    } catch (error) {
      message.error("Failed to add account: " + error);
    }
  };

  const handleRemoveAccount = async (email) => {
    try {
      await invoke("remove_account", { email });
      message.success("Account removed successfully");
    } catch (error) {
      message.error("Failed to remove account: " + error);
    }
  };

  const handleSwitchAccount = async (email) => {
    try {
      await invoke("switch_account", { email });
      message.success(`Switched to account: ${email}`);
      fetchData();
    } catch (error) {
      message.error("Failed to switch account: " + error);
    }
  };

  const handleShowSSHKey = async (email) => {
    try {
      const sshKey = await invoke("get_ssh_key", { email });
      Modal.info({
        title: "SSH Public Key",
        content: (
          <div>
            <Text strong>Email: {email}</Text>
            <Input.TextArea value={sshKey} rows={4} readOnly />
            <Button
              icon={<CopyOutlined />}
              onClick={() => {
                navigator.clipboard.writeText(sshKey);
                message.success("SSH key copied to clipboard");
              }}
              style={{ marginTop: 8 }}
            >
              Copy to Clipboard
            </Button>
          </div>
        ),
      });
    } catch (error) {
      message.error("Failed to fetch SSH key: " + error);
    }
  };

  const handleShowErrorDialogModeal = (message) => {
    Modal.error({
      title: "Error",
      content: message,
    });
  };

  const handleShowCurrentUserSSHKey = async () => {
    if (!currentUser) {
      handleShowErrorDialogModeal(
        "No current user found in the system , please add a user first and if you have added a user then switch to that user and try again"
      );
      return;
    }
    handleShowSSHKey(currentUser.email);
  };

  const handleRemoveAllAccounts = async () => {
    Modal.confirm({
      title: "Are you sure you want to remove all accounts?",
      onOk: async () => {
        try {
          await invoke("remove_all_accounts");
          message.success("All accounts removed successfully");
        } catch (error) {
          message.error("Failed to remove all accounts: " + error);
        }
      },
    });
  };

  const renderAccountList = (
    showDeleteButton = false,
    showSwitchButton = false
  ) => (
    <List
      grid={{ gutter: 16, column: 1 }}
      dataSource={accounts}
      renderItem={(item) => (
        <List.Item>
          <Card
            title={<Title level={4}>{item.name}</Title>}
            extra={
              <Space>
                {showSwitchButton && (
                  <Button
                    onClick={() => handleSwitchAccount(item.email)}
                    disabled={item.is_active}
                    type={item.is_active ? "primary" : "default"}
                  >
                    {item.is_active ? "Active" : "Switch"}
                  </Button>
                )}
                <Tooltip title="Show SSH Key">
                  <Button
                    icon={<KeyOutlined />}
                    onClick={() => handleShowSSHKey(item.email)}
                  >
                    Show SSH Keys
                  </Button>
                </Tooltip>
                {showDeleteButton && (
                  <Tooltip title="Delete Account">
                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveAccount(item.email)}
                    />
                  </Tooltip>
                )}
              </Space>
            }
          >
            <Text strong>Email: </Text>
            <Text>{item.email}</Text>
            <br />
            <Text strong>Status: </Text>
            <Tag color={item.is_active ? "green" : "default"}>
              {item.is_active ? "Active" : "Inactive"}
            </Tag>
          </Card>
        </List.Item>
      )}
    />
  );

  const getThemeToken = (isDarkMode) => ({
    colorBgContainer: isDarkMode ? "#141414" : "#ffffff",
    colorText: isDarkMode ? "#ffffff" : "#000000",
    colorTextSecondary: isDarkMode ? "#a6a6a6" : "#595959",
    colorBgElevated: isDarkMode ? "#1f1f1f" : "#ffffff",
    colorBorder: isDarkMode ? "#303030" : "#d9d9d9",
  });

  return (
    <ConfigProvider
      theme={{
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: getThemeToken(darkMode),
      }}
    >
      <Layout style={{ minHeight: "100vh" }}>
        <Header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 16px",
            background: darkMode ? "#141414" : "#ffffff",
          }}
        >
          <Title
            level={3}
            style={{ margin: 0, color: darkMode ? "#ffffff" : "#000000" }}
          >
            GitSwitch
          </Title>
          <Tag
            style={{
              color: darkMode ? "#ffffff" : "#000000",
              borderColor: darkMode ? "#303030" : "#d9d9d9",
            }}
          >
            {currentUser && (
              <Text style={{ color: "inherit" }}>
                Current User: {currentUser.name} ({currentUser.email})
              </Text>
            )}
          </Tag>
          <Space>
            <Switch
              checkedChildren={<BulbFilled />}
              unCheckedChildren={<BulbOutlined />}
              checked={darkMode}
              onChange={setDarkMode}
            />
            <Button icon={<LogoutOutlined />} onClick={() => window.close()}>
              Exit
            </Button>
          </Space>
        </Header>
        <Layout>
          <Sider width={200} theme={darkMode ? "dark" : "light"}>
            <Menu
              mode="inline"
              selectedKeys={[currentTab]}
              onClick={({ key }) => setCurrentTab(key)}
              style={{ height: "100%", borderRight: 0 }}
              theme={darkMode ? "dark" : "light"}
            >
              <Menu.Item key="list" icon={<UserOutlined />}>
                List Accounts
              </Menu.Item>
              <Menu.Item key="add" icon={<UserAddOutlined />}>
                Add Account
              </Menu.Item>
              <Menu.Item key="switch" icon={<SwapOutlined />}>
                Switch Account
              </Menu.Item>
              <Menu.Item key="remove" icon={<UserDeleteOutlined />}>
                Remove Account
              </Menu.Item>
              <Menu.Item key="currentSSH" icon={<KeyOutlined />}>
                Current User SSH Key
              </Menu.Item>
              <Menu.Item
                key="removeAll"
                icon={<DeleteOutlined />}
                onClick={handleRemoveAllAccounts}
              >
                Remove All Accounts
              </Menu.Item>

              <Menu.Item key="Help/Guide" icon={<BulbOutlined />}>
                {" "}
                Help/Guide{" "}
              </Menu.Item>
            </Menu>
          </Sider>
          <Layout
            style={{
              padding: "24px",
              background: darkMode ? "#141414" : "#ffffff",
            }}
          >
            <Content>
              <Tabs activeKey={currentTab} onChange={setCurrentTab}>
                <TabPane tab="List Accounts" key="list">
                  {renderAccountList()}
                </TabPane>
                <TabPane tab="Add Account" key="add">
                  <Form onFinish={handleAddAccount} layout="vertical">
                    <Form.Item
                      name="name"
                      label={<Text strong>Name</Text>}
                      rules={[{ required: true }]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      name="email"
                      label={<Text strong>Email</Text>}
                      rules={[{ required: true, type: "email" }]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item>
                      <Button type="primary" htmlType="submit">
                        Add Account
                      </Button>
                    </Form.Item>
                  </Form>
                  {newAccountSSHKey && (
                    <div style={{ marginTop: 16 }}>
                      <Title level={4}>New Account SSH Key</Title>
                      <Text>
                        Please copy this SSH key and add it to your GitHub
                        account:
                      </Text>
                      <Input.TextArea
                        value={newAccountSSHKey}
                        rows={4}
                        readOnly
                      />
                      <Button
                        icon={<CopyOutlined />}
                        style={{ marginTop: 8 }}
                        onClick={() => {
                          navigator.clipboard.writeText(newAccountSSHKey);
                          message.success("SSH key copied to clipboard");
                        }}
                      >
                        Copy to Clipboard
                      </Button>

                      <Title level={5}>Note:</Title>
                      <Text>
                        Please make sure to add this SSH key to your GitHub
                        account to enable Git operations.
                      </Text>

                      <Text>
                        <p>Step 1 : Go to Github.com</p>
                        <p>Step 2 : Go to Settings</p>
                        <p>Step 3 : Go to SSH and GPG keys</p>
                        <p>Step 4 : Add new SSH key</p>
                        <p>Step 5 : Paste the copied key</p>
                        <p>Step 6 : Save</p>
                        <p>
                          {" "}
                          *Note : After pating the key , you can test the ssh
                          key by running the following command in the terminal :
                          ssh -T git@github.com , if you get a success message
                          then the key is working fine and you can start using
                          the account
                        </p>
                      </Text>
                    </div>
                  )}
                </TabPane>
                <TabPane tab="Switch Account" key="switch">
                  {renderAccountList(false, true)}
                </TabPane>
                <TabPane tab="Remove Account" key="remove">
                  {renderAccountList(true)}
                </TabPane>
                <TabPane tab="Current User SSH Key" key="currentSSH">
                  <Button onClick={handleShowCurrentUserSSHKey}>
                    Show Current User SSH Key
                  </Button>
                </TabPane>

                <TabPane tab="Help/Guide" key="Help/Guide">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "auto auto",
                      gap: "20px",
                    }}
                  >
                    <div>
                      <Title level={4}>Help/Guide</Title>

                      <Text>
                        <Title level={5}>List Accounts</Title>
                        <Text>
                          This tab will list all the accounts that are added to
                          the system
                        </Text>
                      </Text>
                      <br />
                      <Title level={5}>Add Account</Title>
                      <Text>
                        This tab will allow you to add a new account to the
                        system
                      </Text>

                      <Text>
                        <br />
                        <Title level={5}>Switch Account</Title>
                        <Text>
                          This tab will allow you to switch between different
                          accounts
                        </Text>
                      </Text>
                      <br />
                      <Text>
                        <Title level={5}>Remove Account</Title>
                        <Text>
                          This tab will allow you to remove an account from the
                          system
                        </Text>
                      </Text>
                      <br />
                      <Text>
                        <Title level={5}>Current User SSH Key</Title>
                        <Text>
                          This tab will show the SSH key of the current user
                        </Text>
                      </Text>
                      <br />
                      <Text>
                        <Title level={5}>Remove All Accounts</Title>
                        <Text>
                          This tab will remove all the accounts from the system
                        </Text>

                        <br />
                        <Title level={5}>Help/Guide</Title>
                        <Text>
                          This tab will guide you through the application
                        </Text>
                      </Text>
                    </div>

                    <div>
                      <Title level={4}>Built By: </Title>
                      <a
                        onClick={function () {
                          open("https://biohacker0.netlify.app");
                        }}
                      >
                        Biohacker0(aka crow)
                      </a>
                      <br />
                      <a
                        onClick={function () {
                          open("https://github.com/biohacker0");
                        }}
                      >
                        Github
                      </a>
                      <br />
                      <a
                        onClick={function () {
                          open("https://twitter.com/corvus_ikshana");
                        }}
                      >
                        Twitter
                      </a>
                      <br />
                      <br />
                      <a
                        onClick={function () {
                          open("https://buymeacoffee.com/biohacker0");
                        }}
                      >
                        If you like my work and software, consider buying me a
                        coffee
                      </a>
                      <Title level={4}>About Me</Title>I am a Software Enginner
                      Currently working in the field of biotechnology building
                      software and solving problems , I am mostly active on
                      twitter, This software is for my personal use and I have
                      made it open source so that others can use it too , This
                      software is a minimilist goto tool for me as I have
                      multiple github accounts and I need to switch between them
                      frequently without any hassle , I hope you like this
                    </div>
                  </div>
                </TabPane>
              </Tabs>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

export default App;
