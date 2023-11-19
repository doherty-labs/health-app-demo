class ObjectStorageService:
    DEFAULT_EXPIRATION = 3600

    def __init__(self, bucket_name, s3_client):
        self.bucket_name = bucket_name
        self.s3_client = s3_client

    def generate_presigned_url(
        self, client_method, method_parameters, expires_in
    ) -> str:
        url = self.s3_client.generate_presigned_url(
            ClientMethod=client_method, Params=method_parameters, ExpiresIn=expires_in
        )
        return url

    def gen_upload_url(self, file_name: str) -> str:
        return self.generate_presigned_url(
            "put_object",
            {"Bucket": self.bucket_name, "Key": file_name},
            self.DEFAULT_EXPIRATION,
        )

    def gen_download_url(self, file_name: str) -> str:
        return self.generate_presigned_url(
            "get_object",
            {"Bucket": self.bucket_name, "Key": file_name},
            self.DEFAULT_EXPIRATION,
        )

    def delete_object(self, file_name: str) -> None:
        self.s3_client.delete_object(Bucket=self.bucket_name, Key=file_name)
