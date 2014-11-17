(ns mpk.action-handlers-test
  (:require [mpk.configuration :refer :all]
            [mpk.action-handlers :as handlers :refer :all]
            [clojure.test :refer :all]
            [mpk.file-utils :as file-utils :refer :all]
            [clojure.data.json :as json])
  (:import (java.io File)))

(def temporary-kanban-folder (str (System/getProperty "java.io.tmpdir") "/mpk"))


(deftest test-the-key-validation-method-no-file
  (testing "Should always return true for key validation"
    (do-build-configuration ["directory" temporary-kanban-folder])
    (file-utils/make-folder temporary-kanban-folder)
    (let [key-handler (handlers/->KeyHandler)]
      (is (= (perform key-handler {"kanbanKey" "foobar"} {})
             (handlers/->Response 200 "{\"success\":true,\"lastUpdated\":0}" {}))))
    (file-utils/clean-folder temporary-kanban-folder)))

(deftest test-the-key-validation-method-with-file
  (testing "Should return value of last modified file"
    (do-build-configuration ["directory" temporary-kanban-folder])
    (file-utils/make-folder temporary-kanban-folder)
    (let [temp-file (File. temporary-kanban-folder "gregster.data")]
      (spit (.getAbsolutePath temp-file) (pr-str "dupa blada"))
    (let [key-handler (handlers/->KeyHandler)]
      (let [response (perform key-handler {"kanbanKey" "gregster"} {})]
        (is (not (= (:body response)
                  "{\"success\":true,\"lastUpdated\":0}"))))))
    (file-utils/clean-folder temporary-kanban-folder)))

(deftest test-reading-persistent-kanban
  (testing "Should read Kanban previously persisted and return content in the response body"
    (do-build-configuration ["directory" temporary-kanban-folder])
    (file-utils/make-folder temporary-kanban-folder)
    (let [temp-file (File. temporary-kanban-folder "gregster.data")]
      (spit (.getAbsolutePath temp-file) "Kanban content")
      (let [read-handler (handlers/->ReadHandler) last-updated (.lastModified temp-file)]
        (is (=
             (:body (perform read-handler {"kanbanKey" "gregster"} {}))
             (json/write-str {"success" true, "lastUpdated" last-updated, "kanban" "Kanban content"})))))
    (file-utils/clean-folder temporary-kanban-folder)))

(deftest test-handling-error-within-body
  (testing "Handling errors within body"
    (is (=
         (handle-error-within-body "Error message")
         (handlers/->Response 200
                    (json/write-str {"success" false, "error" "Error message"})
                    {})))))

(deftest test-reading-non-existing-kanban
  (testing "Should return error within body if Kanban doesn't exist"
    (let [read-handler (handlers/->ReadHandler)
          response (perform read-handler {"kanbanKey" "foobarboo"} {})]
      (is (= (:body response) (json/write-str {"success" false "error" "Kanban with key [foobarboo] was never persisted"})))
      (is (= (:status response) 200)))))

(deftest test-processing-save-session-starts
  (testing "Should start session when fragments in parameters list"
    (let [save-handler (handlers/->SaveHandler)
          response (perform save-handler {"fragments" "4"} {})]
      (is (= (:session response) {:number-of-fragments 4 :fragments [nil nil nil nil]}))
      (is (= (:status response) 200)))))

(deftest test-creating-empty-array
  (testing "If empty array is created"
    (is (= (create-empty-array 5) [nil nil nil nil nil]))))

(deftest test-adding-fragment-to-session
  (testing "Should add fragment to existing session"
    (let [save-handler (handlers/->SaveHandler)
          response
          (perform save-handler {"chunk" "boo" "chunkNumber" "2"} {:number-of-fragments 2 :fragments [nil nil]})]
      (is (= (:session response) {:number-of-fragments 2 :fragments [nil "boo"]})))))

(deftest test-adding-fragment-to-session-with-no-previous-fragments
  (testing "Should fail and clear session when saving chunk but there are no fragments in session"
    (let [save-handler (handlers/->SaveHandler)
          response
          (perform save-handler {"chunk" "boo" "chunkNumber" "2"} {:number-of-fragments 2})]
      (is (= (:session response) {}))
      (is (= (:body response) (json/write-str {"success" false "error" "Some old junk in the session. Try to save again."}))))))

(deftest test-saving-full-kanban
  (testing "Should persist kanban into file when valid hash is received"
    (do-build-configuration ["directory" temporary-kanban-folder])
    (let [save-handler (handlers/->SaveHandler)
          params {"hash" "adbf5a778175ee757c34d0eba4e932bc" "kanbanKey" "foo-bar"}
          session {:number-of-fragments 2 :fragments ["as" "da"]}
          response (perform save-handler params session)]
      (is (= (:body response) (json/write-str {"success" true})))
      (is (= (:status response) 201)))
    (file-utils/clean-folder temporary-kanban-folder)))

(deftest test-saving-full-kanban-hash-failure
  (testing "Should fail to save kanban when hash fails"
    (let [save-handler (handlers/->SaveHandler)
          params {"hash" "adbf5a778175ee757c34d0eba4e932" "kanbanKey" "foo-bar"}
          session {:number-of-fragments 2 :fragments ["as" "da"]}
          response (perform save-handler params session)]
      (is (= (:body response) (json/write-str {"success" false "error" "Received kanban doesn't validate with Hash. adbf5a778175ee757c34d0eba4e932 <=> adbf5a778175ee757c34d0eba4e932bc"})))
      (is (= (:status response) 200)))))
