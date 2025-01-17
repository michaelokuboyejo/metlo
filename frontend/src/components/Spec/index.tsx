import React, { useRef, useState } from "react"
import NextLink from "next/link"
import { useRouter } from "next/router"
import {
  Heading,
  useColorModeValue,
  HStack,
  VStack,
  Text,
  InputGroup,
  Button,
  useToast,
} from "@chakra-ui/react"
import { AiFillApi } from "@react-icons/all-files/ai/AiFillApi"
import darkTheme from "prism-react-renderer/themes/duotoneDark"
import lightTheme from "prism-react-renderer/themes/github"
import Highlight, { defaultProps } from "prism-react-renderer"
import { OpenApiSpec } from "@common/types"
import { deleteSpec, updateSpec } from "api/apiSpecs"
import { makeToast } from "utils"

interface SpecPageProps {
  spec: OpenApiSpec
}

const SpecPage: React.FC<SpecPageProps> = React.memo(({ spec }) => {
  const theme = useColorModeValue(lightTheme, darkTheme)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const router = useRouter()
  const toast = useToast()
  const [fetching, setFetching] = useState<boolean>(false)
  const [deleting, setDeleting] = useState<boolean>(false)
  const handleClick = () => inputRef.current?.click()
  const handleSubmission = async (evt: React.ChangeEvent<HTMLInputElement>) => {
    setFetching(true)
    const file = evt.target.files[0]
    if (!file) {
      return
    }
    try {
      await updateSpec(spec.name, file)
      router.reload()
    } catch (err) {
      const errMessage = err.response.data?.message
      const title = errMessage
        ? `Upload Failed: ${errMessage}`
        : "Upload Failed..."
      const errors = err.response.data?.errors
      const description = errors ? errors.join(" ") : err.response.data
      toast(
        makeToast(
          {
            title,
            size: "xl",
            description,
            status: "error",
            duration: 1000000,
          },
          err.response?.status,
        ),
      )
    }
    setFetching(false)
  }
  const handleDelete = async (evt: React.MouseEvent<HTMLDivElement>) => {
    setDeleting(true)
    try {
      await deleteSpec(spec.name)
      router.push("/specs")
    } catch (err) {
      console.log(err)
      toast(
        makeToast(
          {
            title: `Couldn't Delete Spec ${spec.name}`,
            status: "error",
            description: "See the console for more details",
          },
          err.response?.status,
        ),
      )
    } finally {
      setDeleting(false)
    }
  }

  const headerColor = useColorModeValue(
    "rgb(179, 181, 185)",
    "rgb(91, 94, 109)",
  )

  return (
    <VStack w="full" alignItems="flex-start" spacing="10">
      <HStack justifyContent="space-between" w="full" alignItems="flex-end">
        <VStack alignItems="flex-start" pt="6">
          <NextLink href="/specs">
            <HStack color={headerColor} spacing="1" cursor="pointer">
              <AiFillApi />
              <Text fontWeight="semibold">API Specs</Text>
            </HStack>
          </NextLink>
          <Heading>{spec.name}</Heading>
        </VStack>

        <HStack marginLeft="auto">
          <InputGroup onClick={handleDelete}>
            <Button colorScheme="red" isLoading={deleting}>
              Delete Spec
            </Button>
          </InputGroup>
          <InputGroup onChange={handleSubmission} onClick={handleClick}>
            <input
              type="file"
              multiple={false}
              hidden
              ref={e => {
                inputRef.current = e
              }}
            />
            <Button colorScheme="blue" isLoading={fetching}>
              Update Spec
            </Button>
          </InputGroup>
        </HStack>
      </HStack>
      <Highlight
        {...defaultProps}
        theme={theme}
        code={spec.spec}
        language={spec.extension}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={className}
            style={{
              ...style,
              fontSize: "14px",
              padding: "8px",
              width: "100%",
              overflowX: "scroll",
              minHeight: "100%",
            }}
          >
            {tokens.map((line, i) => (
              <pre
                style={{
                  textAlign: "left",
                  margin: "1em 0",
                  padding: "0.5em",
                  overflow: "scroll",
                }}
                key={i}
                {...getLineProps({ line, key: i })}
              >
                <span
                  style={{
                    display: "table-cell",
                    textAlign: "right",
                    paddingRight: "1em",
                    userSelect: "none",
                    opacity: "0.5",
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ display: "table-cell" }}>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token, key })} />
                  ))}
                </span>
              </pre>
            ))}
          </pre>
        )}
      </Highlight>
    </VStack>
  )
})

export default SpecPage
