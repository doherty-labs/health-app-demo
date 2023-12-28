import type { NextPageWithLayout } from "./_app";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import Layout from "../components/layout";
import { ReactElement, useState } from "react";
import { getAllPractices } from "./api/practice/all";
import { components } from "../schemas/api-types";
import {
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  Input,
} from "@chakra-ui/react";
import { PracticesTableComponent } from "../components/table/practices";
import { useRouter } from "next/router";
import Head from "next/head";
import { usePractices } from "../components/search/practice";
import { useTableState } from "../state/table";
import axios, { AxiosResponse } from "axios";
import { useLoading } from "../state/loading";
import { withPageToken } from "../components/auth0-utils";

type PracticeType = components["schemas"]["Practice"];

interface PageProps {
  count: number | undefined;
  next: string;
  previous: string;
  results: PracticeType[] | undefined;
}

const AllPracticesPage: NextPageWithLayout<PageProps> = (props) => {
  const [search, setSearch] = useState<string>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [selected, setSelected] = useState<PracticeType[]>([]);
  const [inviteEmail, setInviteEmail] = useState<string>("");
  const [practiceInvite, setPracticeInvite] = useState<PracticeType>();
  const { push } = useRouter();
  const { dataset } = usePractices<PageProps>({
    searchString: search,
    initialAllResults: props,
    pageNumber: page,
  });
  const { sort, setSort } = useTableState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { setLoading, loading } = useLoading();
  const maxPage = dataset.count ? Math.ceil(dataset.count / pageSize) : 1;

  const inviteUser = async (email: string, practiceId: number) => {
    setLoading(true);
    const url = `/api/practice/${practiceId}/invite`;
    const searchPractice: Promise<AxiosResponse> = axios.post(
      url,
      {
        email,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    await searchPractice;
    setLoading(false);
    onClose();
  };

  return (
    <Flex>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Invite User</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Email"
              type="email"
              onChange={(e) => {
                setInviteEmail(e.target.value);
              }}
            />
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              isLoading={loading}
              onClick={() => {
                if (practiceInvite && practiceInvite.id)
                  inviteUser(inviteEmail, practiceInvite.id);
              }}
            >
              Invite
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <PracticesTableComponent
        data={dataset.results || []}
        title="Practices"
        headers={[
          {
            name: "Name",
            id: "name",
            sort: "none",
            hasCheckbox: true,
            canSort: true,
          },
          {
            name: "Address",
            id: "address_line_1",
            sort: "none",
            hasCheckbox: false,
            canSort: true,
          },
        ]}
        count={dataset.count || 0}
        sort={sort}
        currentPage={page}
        pageSize={pageSize}
        maxPage={maxPage}
        selected={selected}
        onSearch={(search) => {
          setSearch(search);
          setPage(1);
        }}
        onSort={(sort) => {
          setSort(sort);
          setPage(1);
        }}
        onCheckboxChange={(checked) => {
          setSelected(checked);
        }}
        onPageChange={(page) => {
          if (page > maxPage) setPage(maxPage);
          else if (page < 1) setPage(1);
          else setPage(page);
        }}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onRowClick={(row) => {
          push(`practice/${row.id}/`);
        }}
        onEditRow={(row) => {
          push(`practice/${row.id}/`);
        }}
        onDeleteRow={(row) => {
          push(`practice/${row.id}/`);
        }}
        onAddRow={() => {
          push(`add-practice`);
        }}
        onInviteRow={(practice) => {
          setPracticeInvite(practice);
          onOpen();
        }}
      />
    </Flex>
  );
};

AllPracticesPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <>
      <Head>
        <title>Practices</title>
      </Head>
      <Layout>{page}</Layout>
    </>
  );
};

export const getServerSideProps = withPageAuthRequired({
  getServerSideProps: withPageToken(async (ctx, token) => {
    const { data } = await getAllPractices(token, "page=1");
    return {
      props: data,
    };
  }),
});

export default AllPracticesPage;
