import superjson from "superjson"
import { GetServerSideProps } from "next"
import { HiOutlineExclamationCircle } from "@react-icons/all-files/hi/HiOutlineExclamationCircle"
import { Box, Heading, HStack, Icon, VStack, Tooltip } from "@chakra-ui/react"
import { SideNavLinkDestination } from "components/Sidebar/NavLinkUtils"
import { SidebarLayoutShell } from "components/SidebarLayoutShell"
import { ContentContainer } from "components/utils/ContentContainer"
import SpecList from "components/SpecList"
import { OpenApiSpec } from "@common/types"
import { getSpecs } from "api/apiSpecs"

const Specs = ({ apiSpecs }) => (
  <SidebarLayoutShell
    title="API Specs"
    currentTab={SideNavLinkDestination.Specs}
  >
    <ContentContainer>
      <VStack w="full" alignItems="flex-start">
        <HStack w="full" mb="8">
          <Heading fontWeight="medium" size="xl">
            API Specs
          </Heading>
          <Box alignSelf="end">
            <Tooltip
              bg="orange.300"
              placement="right"
              shouldWrapChildren
              label="Any Swagger(OpenAPI V2) specifications will be converted to OpenAPI V3 and stored as such."
            >
              <Icon
                as={HiOutlineExclamationCircle}
                boxSize="30px"
                color="orange.500"
              />
            </Tooltip>
          </Box>
        </HStack>
        <SpecList apiSpecs={superjson.parse<OpenApiSpec[]>(apiSpecs)} />
      </VStack>
    </ContentContainer>
  </SidebarLayoutShell>
)

export const getServerSideProps: GetServerSideProps = async context => {
  const apiSpecs = await getSpecs()
  return { props: { apiSpecs: superjson.stringify(apiSpecs) } }
}

export default Specs
