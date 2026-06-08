import React, { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Code,
  Heading,
  HStack,
  ListItem,
  SimpleGrid,
  Text,
  UnorderedList,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import { FaRegCopy } from 'react-icons/fa';

const CLI_TARBALL_URL = 'https://github.com/CommitQuest/cli/releases/download/v0.1.2/commitquest-0.1.2.tgz';
const CLI_INSTALL_COMMAND = `npm install -g ${CLI_TARBALL_URL}`;
const CopyIcon = FaRegCopy as React.ComponentType<{ size?: number }>;

const CodeBlock: React.FC<{ children: string }> = ({ children }) => (
  <Box
    as="pre"
    bg="#000"
    border="2px solid"
    borderColor="green.400"
    borderRadius="md"
    color="green.200"
    fontSize="sm"
    overflowX="auto"
    p={4}
    w="full"
  >
    <Code bg="transparent" color="inherit" whiteSpace="pre">
      {children}
    </Code>
  </Box>
);

const Downloads: React.FC = () => {
  const cardBg = useColorModeValue('commitQuest.panel', 'commitQuest.panel');
  const borderColor = useColorModeValue('green.400', 'green.400');
  const [copied, setCopied] = useState(false);

  const handleCopyInstall = async () => {
    await navigator.clipboard.writeText(CLI_INSTALL_COMMAND);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box py={8}>
      <VStack align="stretch" spacing={8}>
        <VStack align="start" spacing={3}>
          <Badge colorScheme="green" fontSize="sm" px={3} py={1} borderRadius="full">
            Tools
          </Badge>
          <Heading color="green.400" size="2xl">
            Download CommitQuest
          </Heading>
          <Text color="green.400" fontSize="lg" maxW="3xl">
            Install the command line tool to track your Git activity, then add the VS Code
            extension to keep your character visible while you work.
          </Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <Card bg={cardBg} border="2px solid" borderColor={borderColor}>
            <CardBody>
              <VStack align="stretch" spacing={5}>
                <VStack align="start" spacing={2}>
                  <Heading color="green.400" size="lg">
                    Command Line Tool
                  </Heading>
                  <Text color="green.400">
                    The CLI lets you log in, view your dashboard, edit your character, and
                    refresh the VS Code extension from any Git repository.
                  </Text>
                </VStack>

                <Box>
                  <Text color="green.400" fontWeight="bold" mb={2}>
                    Requirements
                  </Text>
                  <UnorderedList color="green.400" spacing={1}>
                    <ListItem>Node.js 18 or newer</ListItem>
                    <ListItem>npm, or another package manager that can install npm tarballs</ListItem>
                    <ListItem>Git installed locally</ListItem>
                  </UnorderedList>
                </Box>

                <Box>
                  <Text color="green.400" fontWeight="bold" mb={2}>
                    Install
                  </Text>
                  <HStack align="stretch" spacing={0}>
                    <CodeBlock>{CLI_INSTALL_COMMAND}</CodeBlock>
                    <Button
                      aria-label="Copy install command"
                      borderLeft="0"
                      borderRadius="md"
                      borderTopLeftRadius={0}
                      borderBottomLeftRadius={0}
                      colorScheme="green"
                      fontSize="2xl"
                      h="auto"
                      minW="56px"
                      onClick={handleCopyInstall}
                      title={copied ? 'Copied!' : 'Copy install command'}
                    >
                      {copied ? '✓' : <CopyIcon size={22} />}
                    </Button>
                  </HStack>
                </Box>

                <HStack spacing={3} flexWrap="wrap">
                  <Button
                    as="a"
                    href={CLI_TARBALL_URL}
                    colorScheme="green"
                    download
                  >
                    Download tarball
                  </Button>
                  <Button
                    as="a"
                    href="https://github.com/CommitQuest/cli/releases/tag/v0.1.2"
                    target="_blank"
                    rel="noreferrer"
                    variant="outline"
                    colorScheme="green"
                  >
                    View release
                  </Button>
                </HStack>

                <Box>
                  <Text color="green.400" fontWeight="bold" mb={2}>
                    Sign in and start using it
                  </Text>
                  <CodeBlock>{'commitquest login\ncommitquest dashboard\ncommitquest stats'}</CodeBlock>
                </Box>

                <Text color="green.400" fontSize="sm">
                  This release is currently distributed as an npm package tarball. If you download
                  it first, install the local file with{' '}
                  <Code colorScheme="green">npm install -g ./commitquest-0.1.2.tgz</Code>.
                </Text>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} border="2px solid" borderColor={borderColor}>
            <CardBody>
              <VStack align="stretch" spacing={5}>
                <VStack align="start" spacing={2}>
                  <Heading color="green.400" size="lg">
                    VS Code Extension
                  </Heading>
                  <Text color="green.400">
                    The extension adds a CommitQuest Avatar panel to the VS Code Explorer,
                    showing your character, level progress, and commit celebrations.
                  </Text>
                </VStack>

                <Box>
                  <Text color="green.400" fontWeight="bold" mb={2}>
                    Requirements
                  </Text>
                  <UnorderedList color="green.400" spacing={1}>
                    <ListItem>VS Code 1.60 or newer</ListItem>
                    <ListItem>The CommitQuest CLI installed and authenticated</ListItem>
                    <ListItem>A CommitQuest account connected to GitHub</ListItem>
                  </UnorderedList>
                </Box>

                <Box>
                  <Text color="green.400" fontWeight="bold" mb={2}>
                    Setup
                  </Text>
                  <UnorderedList color="green.400" spacing={2}>
                    <ListItem>Install the CommitQuest Avatar extension in VS Code.</ListItem>
                    <ListItem>
                      Run <Code colorScheme="green">commitquest login</Code> if you have not
                      already signed in through the CLI.
                    </ListItem>
                    <ListItem>
                      Open the Explorer sidebar and look for the CommitQuest Avatar panel.
                    </ListItem>
                    <ListItem>
                      Use the command palette action{' '}
                      <Code colorScheme="green">Refresh CommitQuest Avatar</Code> to refresh
                      manually.
                    </ListItem>
                  </UnorderedList>
                </Box>

                <HStack spacing={3} flexWrap="wrap">
                  <Button colorScheme="green" isDisabled>
                    Marketplace listing coming soon
                  </Button>
                  <Button
                    as="a"
                    href="https://code.visualstudio.com/docs/editor/extension-marketplace"
                    target="_blank"
                    rel="noreferrer"
                    variant="outline"
                    colorScheme="green"
                  >
                    How to install extensions
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default Downloads;
